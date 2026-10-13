"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@/lib/sessions";
import Markdown from "./Markdown";
import PrdUpload from "./PrdUpload";
import { BOARD_EVENT, type BoardEvent } from "./board";
import { PRD_FOCUS, ago, clearPendingPrd, fetchMine, fetchPrd, pendingPrd, postComment, readSeen, removeComment, splitSections, writeSeen, type Prd, type PrdComment, type PrdSummary } from "./prd";
import type { Store } from "./store";
import { CopyIcon, Hero, Section, useCopy, useToast } from "./ui";

// 소모임 회차의 PRD 페이지.
// 학회원: 내가 올린 PRD를 읽기 좋게 보고, 칸(## 제목)마다 달린 피드백을 보고 답글을 단다.
// 운영진(ADMIN_EMAILS): 올린 사람 목록에서 골라 칸마다 피드백을 단다.
export default function PrdView({ ses, s, go }: { ses: Session; s: Store; go: (id: string) => void }) {
  const [admin, setAdmin] = useState(false);
  const [list, setList] = useState<PrdSummary[] | null>(null);
  const [doc, setDoc] = useState<{ prd: Prd; comments: PrdComment[] } | null>(null);
  // 현황판이나 알림에서 누르고 들어왔으면 그 기획서를 바로 연다
  const [sel, setSel] = useState<string | null>(() => pendingPrd());
  const [selTick, setSelTick] = useState(0);
  const [seen, setSeen] = useState<Record<string, number>>(() => (typeof window === "undefined" ? {} : readSeen()));
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [err, setErr] = useState("");

  // 목록·내 PRD 불러오기. 다시 올리거나 새로고침하면 tick 을 올려 다시 부른다
  const [tick, setTick] = useState(0);
  const load = () => setTick((t) => t + 1);
  useEffect(() => {
    let alive = true;
    fetchMine(ses.id)
      .then((r) => {
        if (!alive) return;
        setAdmin(r.admin);
        setList(r.list);
        if (!r.admin) setDoc(r.mine ? { prd: r.mine, comments: r.comments } : null);
        setState("ok");
      })
      .catch((e) => {
        if (!alive) return;
        setErr((e as Error).message);
        setState("error");
      });
    return () => {
      alive = false;
    };
  }, [ses.id, tick]);

  // 운영진이 목록에서 고르면 그 PRD를 불러오고, 읽은 버전을 기억한다
  useEffect(() => {
    if (!admin || !sel) return;
    let alive = true;
    fetchPrd(sel)
      .then((r) => {
        if (!alive) return;
        setDoc({ prd: r.prd, comments: r.comments });
        setSeen((m) => {
          const next = { ...m, [r.prd.id]: r.prd.version };
          writeSeen(next);
          return next;
        });
      })
      .catch((e) => alive && setErr((e as Error).message));
    return () => {
      alive = false;
    };
  }, [admin, sel, selTick]);

  // 새로 올라오면 바로 반영: 목록을 다시 받고, 보고 있던 기획서가 새 버전이면 그것도 다시 받는다
  useEffect(() => {
    clearPendingPrd();
    const onLive = (e: Event) => {
      const ev = (e as CustomEvent<BoardEvent>).detail;
      if (ev.session !== ses.id || !ev.prd) return;
      setTick((t) => t + 1);
      if (ev.prd === sel) setSelTick((t) => t + 1);
    };
    const onFocus = (e: Event) => {
      setSel((e as CustomEvent<string>).detail);
      clearPendingPrd();
    };
    window.addEventListener(BOARD_EVENT, onLive);
    window.addEventListener(PRD_FOCUS, onFocus);
    return () => {
      window.removeEventListener(BOARD_EVENT, onLive);
      window.removeEventListener(PRD_FOCUS, onFocus);
    };
  }, [ses.id, sel]);

  // 운영진은 고른 PRD가 다 불러와졌을 때만 보여 준다
  const shown = doc && (!admin || doc.prd.id === sel) ? doc : null;

  const onComments = (comments: PrdComment[]) => {
    setDoc((d) => (d ? { ...d, comments } : d));
    if (admin && doc) setList((l) => l?.map((x) => (x.id === doc.prd.id ? { ...x, comments: comments.length } : x)) ?? l);
  };

  return (
    <article>
      <Hero
        chip={ses.label}
        meta="PRD"
        title={admin ? "올라온 PRD" : "내 PRD"}
        lead={
          admin
            ? "고르면 칸마다 피드백을 달 수 있어요. 올린 사람만 자기 PRD와 피드백을 봐요."
            : "올린 PRD를 읽기 좋게 보여 줘요. 운영진이 칸마다 피드백을 달면 여기에 떠요. 고친 다음 다시 올리면 새 버전이 돼요."
        }
      />

      {state === "loading" && <p className="board-msg">불러오는 중...</p>}
      {state === "error" && <p className="board-msg">{err}</p>}

      {state === "ok" && admin && (
        <Section i={0} title="올린 사람" note={list ? `${list.length}명` : undefined}>
          {list && list.length === 0 && <p className="board-msg">아직 아무도 안 올렸어요</p>}
          <ul className="prd-list">
            {(list || []).map((x) => (
              <li key={x.id}>
                <button type="button" aria-current={sel === x.id ? "true" : undefined} onClick={() => setSel(x.id)}>
                  <b>
                    {x.name} {(seen[x.id] || 0) < x.version && <em className="prd-new">{seen[x.id] ? "새 버전" : "새로 올라옴"}</em>}
                  </b>
                  <span>
                    v{x.version} · {ago(x.updated_at)}
                    {x.comments ? ` · 피드백 ${x.comments}` : " · 피드백 없음"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="textlink prd-reload" onClick={load}>
            목록 새로고침
          </button>
        </Section>
      )}

      {state === "ok" && admin && sel && !shown && <p className="board-msg">불러오는 중...</p>}
      {state === "ok" && shown && <PrdDoc key={shown.prd.id} prd={shown.prd} comments={shown.comments} admin={admin} me={s.name} onComments={onComments} />}

      {state === "ok" && !admin && (
        <Section i={2} title={doc ? "새 버전 올리기" : "PRD 올리기"} note="docs/PRD.md 파일 그대로">
          <PrdUpload key={tick} ses={ses} s={s} go={go} onUploaded={load} />
        </Section>
      )}

      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go(ses.page)}>
          ← {ses.label} 개요
        </button>
        <span />
      </nav>
    </article>
  );
}

function PrdDoc({ prd, comments, admin, me, onComments }: { prd: Prd; comments: PrdComment[]; admin: boolean; me: string; onComments: (c: PrdComment[]) => void }) {
  const { copy, Fallback } = useCopy();
  const sections = useMemo(() => splitSections(prd.content), [prd.content]);
  const keys = new Set(sections.map((x) => x.key));
  const by = (key: string) => comments.filter((c) => c.section === key);
  const orphans = comments.filter((c) => c.section !== "*" && !keys.has(c.section));
  const canWrite = admin || prd.mine;

  const add = (c: PrdComment) => onComments([...comments, c]);
  const del = (id: string) => onComments(comments.filter((c) => c.id !== id));
  const props = { prd, me, admin, canWrite, add, del };

  return (
    <section className="prd-doc">
      <div className="prd-head">
        <div>
          <b>{prd.name}</b>
          <span>
            {prd.filename} · v{prd.version} · {ago(prd.updated_at)} 올림
          </span>
        </div>
        <button type="button" className="copy-trigger" onClick={() => copy(prd.content, "원문을 복사했어요")}>
          <CopyIcon />
          원문 복사
        </button>
      </div>
      {Fallback && <div className="copy-fallback">{Fallback}</div>}

      <div className="prd-sec prd-all">
        <h3 className="prd-all-h">전체 피드백</h3>
        <Thread section="*" items={by("*")} {...props} empty={admin ? "PRD 전체에 대한 한 줄 평을 남겨요" : "아직 전체 피드백이 없어요"} />
      </div>

      {sections.map((x) => (
        <div className="prd-sec" key={x.key || "_intro"}>
          <Markdown text={x.text} />
          {x.key && <Thread section={x.key} items={by(x.key)} {...props} />}
        </div>
      ))}

      {orphans.length > 0 && (
        <div className="prd-sec">
          <h3 className="prd-all-h">지금 버전에 없는 칸에 단 피드백</h3>
          {orphans.map((c) => (
            <Note key={c.id} c={c} prd={prd} onDelete={del} showSection />
          ))}
        </div>
      )}
    </section>
  );
}

function Thread({
  section,
  items,
  prd,
  me,
  admin,
  canWrite,
  add,
  del,
  empty,
}: {
  section: string;
  items: PrdComment[];
  prd: Prd;
  me: string;
  admin: boolean;
  canWrite: boolean;
  add: (c: PrdComment) => void;
  del: (id: string) => void;
  empty?: string;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { comment } = await postComment({ prdId: prd.id, section, body: text, name: me.trim() });
      add(comment);
      setText("");
      setOpen(false);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="prd-thread">
      {items.map((c) => (
        <Note key={c.id} c={c} prd={prd} onDelete={del} />
      ))}
      {items.length === 0 && empty && !open && <p className="prd-empty">{empty}</p>}
      {canWrite &&
        (open ? (
          <div className="prd-write">
            <textarea
              className="field"
              rows={3}
              maxLength={4000}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
              }}
              placeholder={admin ? "이 칸에 대한 피드백 (근거가 약한 곳, 줄일 것, 다음에 확인할 것)" : "답글이나 질문"}
            />
            <div className="prd-write-acts">
              <button type="button" className="btn btn-ink btn-sm" disabled={busy || !text.trim()} onClick={send}>
                {busy ? "올리는 중..." : "남기기"}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="prd-add" onClick={() => setOpen(true)}>
            {admin ? "+ 피드백" : items.length ? "+ 답글" : "+ 메모"}
          </button>
        ))}
    </div>
  );
}

function Note({ c, prd, onDelete, showSection }: { c: PrdComment; prd: Prd; onDelete: (id: string) => void; showSection?: boolean }) {
  const toast = useToast();
  const remove = async () => {
    if (!window.confirm("이 피드백을 지울까요?")) return;
    try {
      await removeComment(c.id);
      onDelete(c.id);
    } catch (e) {
      toast((e as Error).message);
    }
  };
  return (
    <div className="prd-note-item" data-admin={c.is_admin ? "1" : "0"}>
      <div className="prd-note-h">
        <b>{c.author}</b>
        {c.is_admin && <em>운영진</em>}
        <span>
          {ago(c.created_at)}
          {c.version < prd.version ? ` · v${c.version}에 단 피드백` : ""}
          {showSection ? ` · ${c.section}` : ""}
        </span>
        {c.mine && (
          <button type="button" className="textlink" onClick={remove}>
            지우기
          </button>
        )}
      </div>
      <p>{c.body}</p>
    </div>
  );
}
