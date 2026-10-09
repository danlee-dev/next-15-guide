"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { ArrowUp, Dots, ease } from "./ui";
import { VERDICT_LABEL, type ChatMsg, type Feedback, type Patch } from "./store";

export function FeedbackPanel({
  stepId,
  stepTitle,
  qa,
  log,
  fb,
  patch,
}: {
  stepId: string;
  stepTitle: string;
  qa: { q: string; a: string }[];
  log?: string;
  fb?: Feedback;
  patch: Patch;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function ask() {
    if (!qa.some((x) => x.a.trim())) {
      setErr("답을 하나 이상 쓰고 눌러 주세요");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/tutor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, stepTitle, answers: qa, log }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "튜터 연결이 끊겼어요");
      patch((s) => ({ ...s, fb: { ...s.fb, [stepId]: json as Feedback } }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="actions">
        <button type="button" className="btn btn-ink" onClick={ask} disabled={busy}>
          {fb ? "다시 피드백 받기" : "튜터 피드백 받기"}
        </button>
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.span key="busy" className="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              튜터가 읽고 있어요 <Dots />
            </motion.span>
          ) : err ? (
            <motion.span key="err" className="status err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {err}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false} mode="wait">
        {fb && (
          <motion.div
            key={fb.feedback}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ overflow: "hidden" }}
          >
            <div className="fb">
              <span className="badge" data-v={fb.verdict}>
                {VERDICT_LABEL[fb.verdict]}
              </span>
              <p>{fb.feedback}</p>
              {fb.next && <p className="next">{fb.next}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TutorChat({
  stepId,
  stepTitle,
  chips,
  thread,
  patch,
}: {
  stepId: string;
  stepTitle: string;
  chips: string[];
  thread: ChatMsg[];
  patch: Patch;
}) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const busy = streaming !== null;
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const next: ChatMsg[] = [...thread, { role: "user", content: question }];
    patch((s) => ({ ...s, chat: { ...s.chat, [stepId]: next } }));
    setText("");
    setErr("");
    setStreaming("");
    let acc = "";
    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, stepTitle, messages: next }),
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "튜터 연결이 끊겼어요");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setStreaming(acc);
      }
      patch((s) => ({ ...s, chat: { ...s.chat, [stepId]: [...next, { role: "assistant", content: acc }] } }));
    } catch (e) {
      setErr((e as Error).message);
      patch((s) => ({ ...s, chat: { ...s.chat, [stepId]: thread } }));
      setText(question);
    } finally {
      setStreaming(null);
      inputRef.current?.focus();
    }
  }

  return (
    <div>
      {chips.length > 0 && thread.length === 0 && (
        <div className="suggest">
          {chips.map((c) => (
            <button key={c} type="button" onClick={() => send(c)} disabled={busy}>
              {c}
            </button>
          ))}
        </div>
      )}
      {(thread.length > 0 || busy) && (
        <div className="thread">
          {thread.map((m, i) => (
            <motion.div
              key={i}
              className={m.role === "user" ? "msg-me" : "msg-ai"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              {m.content}
            </motion.div>
          ))}
          {busy && <div className="msg-ai">{streaming || <Dots />}</div>}
        </div>
      )}
      <form
        className="askbar"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input
          ref={inputRef}
          id={`chat-${stepId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="이해 안 되는 걸 물어보세요"
          autoComplete="off"
          aria-label="튜터에게 질문"
        />
        <button type="submit" className="sendbtn" disabled={busy || !text.trim()} aria-label="보내기">
          <ArrowUp />
        </button>
      </form>
      {err && <p className="status err" style={{ marginTop: 10 }}>{err}</p>}
    </div>
  );
}
