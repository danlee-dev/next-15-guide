"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/sessions";
import Markdown from "./Markdown";
import { PRD_MAX, ago, fetchMine, uploadPrd, type Prd } from "./prd";
import type { Store } from "./store";
import { useToast } from "./ui";

// PRD 단계의 "PRD 올리기" 칸. docs/PRD.md 파일을 고르면 그려진 모습을 먼저 보여 주고, 올리면 운영진이 칸마다 피드백을 단다.
// 다시 올리면 새 버전이 된다
export default function PrdUpload({ ses, s, go, onUploaded }: { ses: Session; s: Store; go: (id: string) => void; onUploaded?: (p: Prd) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [mine, setMine] = useState<Prd | null>(null);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [picked, setPicked] = useState<{ name: string; content: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    fetchMine(ses.id)
      .then((r) => {
        if (!alive) return;
        setMine(r.mine);
        setCount(r.comments.filter((c) => !c.mine).length);
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [ses.id]);

  const pick = async (f: File | undefined) => {
    setErr("");
    if (!f) return;
    if (!/\.(md|markdown|txt)$/i.test(f.name)) return setErr(".md 파일만 올릴 수 있어요. docs/PRD.md 를 골라 주세요");
    if (f.size > PRD_MAX * 3) return setErr("파일이 너무 커요");
    const content = (await f.text()).replace(/\r\n/g, "\n");
    if (!content.trim()) return setErr("파일이 비어 있어요");
    if (content.length > PRD_MAX) return setErr("파일이 너무 커요 (20만 자까지)");
    setPicked({ name: f.name, content });
    setOpen(false);
  };

  const send = async () => {
    if (!picked) return;
    setBusy(true);
    setErr("");
    try {
      const { prd } = await uploadPrd({ session: ses.id, name: s.name.trim(), filename: picked.name, content: picked.content });
      setMine(prd);
      setPicked(null);
      if (input.current) input.current.value = "";
      toast(prd.version > 1 ? `v${prd.version}로 올렸어요` : "PRD를 올렸어요");
      onUploaded?.(prd);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="prd-up">
      {mine && (
        <div className="prd-now">
          <span>
            <b>v{mine.version}</b> {mine.filename} · {ago(mine.updated_at)} 올림{count > 0 ? ` · 피드백 ${count}개` : ""}
          </span>
          {ses.prdPage && (
            <button type="button" className="btn btn-ink btn-sm" onClick={() => go(ses.prdPage!)}>
              {count > 0 ? "피드백 보기" : "올린 PRD 보기"}
            </button>
          )}
        </div>
      )}

      {!picked && (
        <label
          className="prd-drop"
          data-drag={drag ? "1" : "0"}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
        >
          <input ref={input} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={(e) => pick(e.target.files?.[0])} />
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" />
            <path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" />
          </svg>
          <b>{mine ? "고친 PRD.md 를 끌어다 놓거나 눌러서 고르기" : "PRD.md 를 끌어다 놓거나 눌러서 고르기"}</b>
          <span>{mine ? "다시 올리면 새 버전이 되고, 이전 피드백은 그대로 남아요" : "docs/PRD.md 파일 그대로. 올리기 전에 어떻게 보이는지 먼저 보여 줘요"}</span>
        </label>
      )}
      {!loaded && !mine && <p className="prd-note">불러오는 중...</p>}

      {picked && (
        <div className="prd-pre">
          <div className="prd-pre-h">
            <span>
              <b>{picked.name}</b> · {picked.content.split("\n").length}줄
            </span>
            <button type="button" className="textlink" onClick={() => setOpen((v) => !v)}>
              {open ? "접기" : "전체 보기"}
            </button>
          </div>
          <div className="prd-pre-body" data-open={open ? "1" : "0"}>
            <Markdown text={picked.content} />
          </div>
          <div className="prd-pre-acts">
            <button type="button" className="btn btn-ink" disabled={busy} onClick={send}>
              {busy ? "올리는 중..." : mine ? `v${mine.version + 1}로 올리기` : "올리기"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setPicked(null);
                if (input.current) input.current.value = "";
              }}
            >
              다른 파일
            </button>
          </div>
        </div>
      )}
      {err && <p className="submit-err">{err}</p>}
    </div>
  );
}
