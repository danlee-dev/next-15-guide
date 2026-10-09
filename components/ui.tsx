"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { COMMANDS, type CommandKey, type OS } from "@/lib/content";

export const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- toast + copy ---------- */
type ToastFn = (msg: string) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback<ToastFn>((m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1800);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16, x: "-50%", scale: 0.96 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 8, x: "-50%", scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastCtx.Provider>
  );
}

export function useCopy() {
  const toast = useToast();
  const [fallback, setFallback] = useState<string | null>(null);
  const copy = useCallback(
    async (text: string, done = "복사했어요") => {
      try {
        await navigator.clipboard.writeText(text);
        setFallback(null);
        toast(done);
      } catch {
        setFallback(text);
        toast("아래 글을 선택해서 복사해 주세요");
      }
    },
    [toast],
  );
  const Fallback = fallback ? (
    <textarea className="fallback" readOnly value={fallback} onFocus={(e) => e.currentTarget.select()} autoFocus />
  ) : null;
  return { copy, Fallback };
}

/* ---------- icons ---------- */
export function CheckPath({ on, color = "currentColor" }: { on: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <motion.path
        d="M2.4 6.3l2.4 2.4 4.8-5.2"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.35, ease }}
      />
    </svg>
  );
}

export const ArrowUpRight = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11L11 5M6 5h5v5" />
  </svg>
);

export const ArrowUp = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
  </svg>
);

export function Dots() {
  return (
    <span className="dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/* ---------- code & prompt ---------- */
function renderLine(line: string, i: number) {
  if (line.trim().startsWith("#")) return <span key={i} className="cm">{line}</span>;
  const parts = line.split(/(<내 아이디>)/);
  return (
    <span key={i}>
      {parts.map((p, j) => (p === "<내 아이디>" ? <span key={j} className="ph">{p}</span> : p))}
    </span>
  );
}

export function CodeBlock({ text, where }: { text: string; where: string }) {
  const { copy, Fallback } = useCopy();
  const lines = text.split("\n");
  return (
    <div>
      <div className="code">
        <div className="code-top">
          <span>{where}</span>
          <button type="button" className="copybtn" onClick={() => copy(text)}>
            복사
          </button>
        </div>
        <pre>
          {lines.map((l, i) => (
            <span key={i}>
              {i > 0 && "\n"}
              {renderLine(l, i)}
            </span>
          ))}
        </pre>
      </div>
      {Fallback}
    </div>
  );
}

export function Command({ k, os }: { k: CommandKey; os: OS }) {
  const c = COMMANDS[k] as { both?: string; mac?: string; win?: string };
  if (c.both) return <CodeBlock text={c.both} where="macOS · Windows 동일" />;
  const t = c[os];
  if (!t) return null;
  return <CodeBlock text={t} where={os === "win" ? "Windows PowerShell" : "macOS 터미널"} />;
}

export function Prompt({ text, own }: { text: string; own?: boolean }) {
  const { copy, Fallback } = useCopy();
  return (
    <div>
      <div className="prompt">
        <p>
          {text.split(/(\[___\])/).map((p, i) => (p === "[___]" ? <span key={i} className="ph">{p}</span> : p))}
        </p>
        <div className="prompt-foot">
          <span>{own ? "예시예요. 내 말로 바꿔서 보내 보세요" : "Claude Code나 Codex에 그대로 붙여넣기"}</span>
          <button type="button" className="copybtn" onClick={() => copy(text, "프롬프트를 복사했어요")}>
            복사
          </button>
        </div>
      </div>
      {Fallback}
    </div>
  );
}

/* ---------- motion helpers ---------- */
export function Section({ i, title, note, children }: { i: number; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <motion.section
      className="sec"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.08 + i * 0.06 }}
    >
      <div className="sec-h">
        <h2>{title}</h2>
        {note && <span className="note">{note}</span>}
      </div>
      {children}
    </motion.section>
  );
}

const ORBS = [
  { c: "var(--orb-1)", w: "52%", h: "70%", l: "6%", t: "14%", x: 40, y: 24, d: 16 },
  { c: "var(--orb-2)", w: "48%", h: "64%", l: "40%", t: "2%", x: -36, y: 30, d: 20 },
  { c: "var(--orb-3)", w: "40%", h: "56%", l: "28%", t: "42%", x: 28, y: -26, d: 18 },
  { c: "var(--orb-4)", w: "34%", h: "50%", l: "62%", t: "36%", x: -24, y: -18, d: 22 },
];

export function Orb() {
  const reduce = useReducedMotion();
  return (
    <div className="orb" aria-hidden="true">
      {ORBS.map((o, i) => (
        <motion.span
          key={i}
          style={{ background: o.c, width: o.w, height: o.h, left: o.l, top: o.t }}
          animate={reduce ? undefined : { x: [0, o.x, 0], y: [0, o.y, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function Hero({ chip, meta, title, lead }: { chip: string; meta: string; title: string; lead: ReactNode }) {
  return (
    <header className="hero">
      <Orb />
      <motion.div className="eyebrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <span className="chip-step">{chip}</span>
        <span>{meta}</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.04 }}>
        {title}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.1 }}>
        {lead}
      </motion.p>
    </header>
  );
}
