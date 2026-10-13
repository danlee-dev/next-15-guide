"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@/lib/sessions";
import Markdown from "./Markdown";
import { PRD_MAX, ago, fetchMine, uploadPrd, type Prd } from "./prd";
import type { Store } from "./store";
import { useToast } from "./ui";

// 제출 단계의 "기획서 제출" 칸. docs/PRD.md 파일을 고르거나 끌어다 놓으면 그 자리에서 바로 올라간다 (따로 누를 버튼 없음).
// 올라간 기획서는 아래에 그려서 보여 주고, 운영진이 칸마다 피드백을 단다. 다시 올리면 새 버전이 된다
export default function PrdUpload({ ses, s, go, onUploaded }: { ses: Session; s: Store; go: (id: string) => void; onUploaded?: (p: Prd) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [mine, setMine] = useState<Prd | null>(null);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
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
    if (!f || busy) return;
    if (!/\.(md|markdown|txt)$/i.test(f.name)) return setErr(".md 파일만 올릴 수 있어요. docs/PRD.md 를 골라 주세요");
    if (f.size > PRD_MAX * 3) return setErr("파일이 너무 커요");
    const content = (await f.text()).replace(/\r\n/g, "\n");
    if (!content.trim()) return setErr("파일이 비어 있어요");
    if (content.length > PRD_MAX) return setErr("파일이 너무 커요 (20만 자까지)");
    setBusy(true);
    try {
      const { prd } = await uploadPrd({ session: ses.id, name: s.name.trim(), filename: f.name, content });
      setMine(prd);
      setOpen(false);
      toast(prd.version > 1 ? `v${prd.version}로 다시 제출했어요` : "기획서를 제출했어요");
      onUploaded?.(prd);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="prd-up">
      {mine && (
        <div className="prd-now">
          <span>
            <b>제출했어요</b> · v{mine.version} {mine.filename} · {ago(mine.updated_at)}
            {count > 0 ? ` · 피드백 ${count}개` : ""}
          </span>
          {ses.prdPage && (
            <button type="button" className="btn btn-ink btn-sm" onClick={() => go(ses.prdPage!)}>
              {count > 0 ? "피드백 보기" : "기획서 페이지"}
            </button>
          )}
        </div>
      )}

      <label
        className="prd-drop"
        data-drag={drag ? "1" : "0"}
        data-busy={busy ? "1" : "0"}
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
        <input ref={input} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" />
          <path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" />
        </svg>
        <b>{busy ? "올리는 중..." : mine ? "고친 PRD.md 를 끌어다 놓거나 눌러서 다시 제출" : "PRD.md 를 끌어다 놓거나 눌러서 제출"}</b>
        <span>{mine ? "고르는 순간 새 버전으로 제출돼요. 이전 피드백은 그대로 남아요" : "파일을 고르는 순간 바로 제출돼요. 따로 누를 버튼은 없어요"}</span>
      </label>
      {!loaded && !mine && <p className="prd-note">불러오는 중...</p>}
      {err && <p className="submit-err">{err}</p>}

      {mine && (
        <div className="prd-pre">
          <div className="prd-pre-h">
            <span>
              제출한 기획서 <b>v{mine.version}</b>
            </span>
            <button type="button" className="textlink" onClick={() => setOpen((v) => !v)}>
              {open ? "접기" : "전체 보기"}
            </button>
          </div>
          <div className="prd-pre-body" data-open={open ? "1" : "0"}>
            <Markdown text={mine.content} />
          </div>
        </div>
      )}
    </div>
  );
}
