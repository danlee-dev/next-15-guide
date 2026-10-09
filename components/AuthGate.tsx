"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TOOL_LABEL, type AgentTool } from "@/lib/content";
import { fetchMe } from "./board";
import { signInWithGoogle, supa } from "./supa";
import { ease } from "./ui";

// 첫 화면: 구글 로그인 → (처음이면) 본명과 주로 쓰는 AI 도구 확인 → 들어가기.
// 이름과 도구는 서버(현황판 테이블)에 계정별로 저장돼서 다른 기기에서 로그인해도 기억한다.
type Phase = "loading" | "signin" | "name" | "done";

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export default function AuthGate({
  tool: savedTool,
  onReady,
  onSignedOut,
}: {
  tool: AgentTool | "";
  onReady: (name: string, tool: AgentTool) => void;
  onSignedOut: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [tool, setTool] = useState<AgentTool | "">(savedTool);
  const toolRef = useRef(savedTool);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const cb = useRef({ onReady, onSignedOut });
  useEffect(() => {
    cb.current = { onReady, onSignedOut };
  });

  useEffect(() => {
    let alive = true;
    const resolve = async () => {
      const { data } = await supa().auth.getSession();
      if (!alive) return;
      if (!data.session) {
        setPhase("signin");
        cb.current.onSignedOut();
        return;
      }
      try {
        const me = await fetchMe();
        if (!alive) return;
        const known = me.tool || toolRef.current;
        if (me.name && known) {
          cb.current.onReady(me.name, known);
          setPhase("done");
        } else {
          // 이름은 있는데 도구를 아직 안 골랐으면(예전에 들어온 사람) 이름은 채워 두고 도구만 고르게 한다
          setName(me.name || me.suggested || "");
          if (known) setTool(known);
          setPhase("name");
        }
      } catch {
        if (alive) setPhase("name");
      }
    };
    resolve();
    const { data: sub } = supa().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") resolve();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const login = async () => {
    setBusy(true);
    setErr("");
    const { error } = await signInWithGoogle();
    if (error) {
      setErr("로그인 창을 열지 못했어요. 잠시 뒤 다시 눌러 주세요.");
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    if (n.length < 2) {
      setErr("본명을 두 글자 이상 적어 주세요");
      return;
    }
    if (!tool) {
      setErr("주로 쓰는 AI 도구를 골라 주세요");
      return;
    }
    cb.current.onReady(n, tool);
    setPhase("done");
  };

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div className="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
          {phase === "signin" && (
            <motion.div className="gate-card" role="dialog" aria-modal="true" aria-labelledby="gate-title" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <Image src="/next-logo-ink.png" alt="NEXT" width={407} height={96} className="gate-logo" priority />
              <h2 id="gate-title">NEXT 15기 개발 가이드</h2>
              <p>Session 8 실습 노트와 바이브 코딩 가이드, 개발 세팅 자료가 여기 있어요. 구글로 로그인하면 진행 상황이 저장되고, 노트북이든 폰이든 이어서 볼 수 있어요.</p>
              <button type="button" className="btn google-btn" onClick={login} disabled={busy}>
                <GoogleMark />
                {busy ? "구글로 이동하는 중..." : "Google로 계속하기"}
              </button>
              {err && <div className="gate-err">{err}</div>}
            </motion.div>
          )}
          {phase === "name" && (
            <motion.form className="gate-card" role="dialog" aria-modal="true" aria-labelledby="gate-title" onSubmit={submit} initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <Image src="/next-logo-ink.png" alt="NEXT" width={407} height={96} className="gate-logo" priority />
              <h2 id="gate-title">이름과 도구를 확인해 주세요</h2>
              <p>꼭 본명으로 적어 주세요. 제출 현황판에 그대로 떠요. 도구를 고르면 그에 맞는 명령어로 안내하고, 위쪽에서 언제든 바꿀 수 있어요.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (err) setErr("");
                }}
                placeholder="이름"
                maxLength={20}
                autoComplete="name"
                aria-label="본명"
                aria-invalid={!!err}
              />
              <div className="gate-label" id="gate-tool">주로 쓰는 AI 도구</div>
              <div className="gate-tools" role="radiogroup" aria-labelledby="gate-tool">
                {(["claude", "codex"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tool === t}
                    onClick={() => {
                      setTool(t);
                      if (err) setErr("");
                    }}
                  >
                    <Image className="gate-tool-ic" src={t === "claude" ? "/refs/logos/claude-code.png" : "/refs/logos/codex.png"} alt="" width={32} height={32} />
                    <b>{TOOL_LABEL[t]}</b>
                    <span>{t === "claude" ? "CLAUDE.md" : "AGENTS.md"}</span>
                  </button>
                ))}
              </div>
              {err && <div className="gate-err">{err}</div>}
              <button type="submit" className="btn btn-ink">
                시작하기
              </button>
            </motion.form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
