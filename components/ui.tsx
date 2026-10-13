"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { COMMANDS, type AgentTool, type CommandKey, type OS } from "@/lib/content";
import { allMarkdown, pageMarkdown } from "./pageMarkdown";

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
// 명령어 속 빈칸(<내 아이디>, <ref>). 그 자리에서 바로 적고, 한 번 적으면 사이트의 모든 명령어에 같이 들어간다.
// 복사할 때도 적은 값으로 바뀐다. 브라우저에 저장해서 새로고침해도 남는다
const FILLS: Record<string, { key: string; hint: string; desc: string }> = {
  "<내 아이디>": { key: "gh-id", hint: "GitHub 아이디", desc: "내 프로필 주소 github.com/ 바로 뒤 부분 (예: github.com/next-kim 이면 next-kim)" },
  "<ref>": { key: "sb-ref", hint: "프로젝트 ref", desc: "Supabase 대시보드 주소 supabase.com/dashboard/project/ 뒤의 영문 20자" },
  "<프로젝트>": { key: "proj", hint: "프로젝트 이름", desc: "영어 소문자와 - 만 써요 (예: dues-helper). 폴더 이름과 레포 이름이 돼요" },
};
const FILL_RE = /(<내 아이디>|<ref>|<프로젝트>)/;
const fillSubs = new Set<() => void>();
const readFill = (tok: string) => {
  try {
    return localStorage.getItem(`next-fill-${FILLS[tok].key}`) || "";
  } catch {
    return "";
  }
};
const writeFill = (tok: string, v: string) => {
  try {
    if (v) localStorage.setItem(`next-fill-${FILLS[tok].key}`, v);
    else localStorage.removeItem(`next-fill-${FILLS[tok].key}`);
  } catch {}
  fillSubs.forEach((f) => f());
};
function useFillsVersion() {
  const [, setN] = useState(0);
  useEffect(() => {
    const f = () => setN((n) => n + 1);
    fillSubs.add(f);
    return () => {
      fillSubs.delete(f);
    };
  }, []);
}
const applyFills = (text: string) => text.split(FILL_RE).map((p) => (FILLS[p] ? readFill(p).trim() || p : p)).join("");

function Blank({ value, hint, onChange, label }: { value: string; hint: string; onChange: (v: string) => void; label: string }) {
  return (
    <span className="ph-in" data-v={value || hint} data-empty={value ? "0" : "1"}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} aria-label={label} size={1} spellCheck={false} autoComplete="off" />
    </span>
  );
}

function renderLine(line: string, i: number, plain = false) {
  if (!plain && line.trim().startsWith("#")) return <span key={i} className="cm">{line}</span>;
  return (
    <span key={i}>
      {line.split(FILL_RE).map((p, j) =>
        FILLS[p] ? <Blank key={j} value={readFill(p)} hint={FILLS[p].hint} label={`${FILLS[p].hint} 입력`} onChange={(v) => writeFill(p, v.trim())} /> : p,
      )}
    </span>
  );
}

// plain: 마크다운 템플릿처럼 # 이 주석이 아닌 글일 때 흐리게 그리지 않는다
export function CodeBlock({ text, where, plain }: { text: string; where: string; plain?: boolean }) {
  const { copy, Fallback } = useCopy();
  useFillsVersion();
  const lines = text.split("\n");
  const hasBlank = FILL_RE.test(text);
  return (
    <div>
      <div className="code">
        <div className="code-top">
          <span>{where}</span>
          <button type="button" className="copybtn" onClick={() => copy(applyFills(text))}>
            복사
          </button>
        </div>
        <pre>
          {lines.map((l, i) => (
            <span key={i}>
              {i > 0 && "\n"}
              {renderLine(l, i, plain)}
            </span>
          ))}
        </pre>
        {hasBlank && (
          <div className="blank-help">
            {[...new Set(text.match(new RegExp(FILL_RE.source, "g")) || [])].map((tok) => (
              <p key={tok}>
                <i aria-hidden="true" />
                <span>
                  <b>{FILLS[tok].hint}</b> {FILLS[tok].desc}. 한 번 적으면 다른 명령어에도 같이 들어가요.
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
      {Fallback}
    </div>
  );
}

export function Command({ k, os }: { k: CommandKey; os: OS }) {
  const c = COMMANDS[k] as { both?: string; mac?: string; win?: string; where?: string; plain?: boolean };
  if (c.both) return <CodeBlock text={c.both} where={c.where || "macOS · Windows 동일"} plain={c.plain} />;
  const t = c[os];
  if (!t) return null;
  return <CodeBlock text={t} where={os === "win" ? "Windows PowerShell" : "macOS 터미널"} />;
}

// 프롬프트 안의 [___] 칸은 그 자리에서 바로 입력한다. 복사하면 입력한 말이 들어가고, 비운 칸은 [___] 그대로 남는다.
// 새로고침해도 남게 브라우저에 저장한다 (프롬프트 글이 바뀌면 다른 칸으로 본다)
const PH = "[___]";
const phKey = (text: string) => {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `next-s8-ph:${h}`;
};

function usePromptBlanks(text: string, count: number) {
  const [vals, setVals] = useState<string[]>(() => Array(count).fill(""));
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(phKey(text)) || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved) && saved.length === count) setVals(saved.map(String));
    } catch {}
  }, [text, count]);
  const save = (next: string[]) => {
    setVals(next);
    try {
      if (next.some((v) => v.trim())) localStorage.setItem(phKey(text), JSON.stringify(next));
      else localStorage.removeItem(phKey(text));
    } catch {}
  };
  return [vals, save] as const;
}

// [___] 또는 [___ 예: 동아리 행사] 처럼 빈칸 안에 무엇을 적을지 힌트를 둘 수 있다
const PH_RE = /\[___(?: ([^\]]+))?\]/g;

export function Prompt({ text, own }: { text: string; own?: boolean }) {
  const { copy, Fallback } = useCopy();
  // split 은 [글, 힌트, 글, 힌트, 글] 로 나온다 (힌트는 없으면 undefined)
  const raw = text.split(PH_RE);
  const parts = raw.filter((_, i) => i % 2 === 0);
  const hints = raw.filter((_, i) => i % 2 === 1).map((h) => h || "직접 입력");
  const blanks = hints.length;
  const [vals, setVals] = usePromptBlanks(text, blanks);
  const filled = vals.some((v) => v.trim());
  const full = parts.reduce((acc, p, i) => acc + (i > 0 ? vals[i - 1]?.trim() || PH : "") + p, "");

  return (
    <div>
      <div className="prompt">
        <p>
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 && (
                <Blank
                  value={vals[i - 1] || ""}
                  hint={hints[i - 1]}
                  label={`빈칸 ${i}${blanks > 1 ? ` / ${blanks}` : ""}: ${hints[i - 1]}`}
                  onChange={(v) => setVals(vals.map((x, j) => (j === i - 1 ? v : x)))}
                />
              )}
              {p}
            </span>
          ))}
        </p>
        <div className="prompt-foot">
          <span>{blanks ? "주황 칸을 내 말로 채우고 복사하면 같이 들어가요" : own ? "예시예요. 내 말로 바꿔서 보내 보세요" : "그대로 붙여넣기"}</span>
          <span className="prompt-acts">
            {filled && (
              <button type="button" className="copybtn ghost" onClick={() => setVals(Array(blanks).fill(""))}>
                초기화
              </button>
            )}
            <button type="button" className="copybtn" onClick={() => copy(full, filled || !blanks ? "프롬프트를 복사했어요" : "빈칸은 [___]로 두고 복사했어요")}>
              복사
            </button>
          </span>
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

// 히어로 뒤 파스텔 빛. 덩어리마다 "흘러가는 위치"(바깥)와 "늘었다 줄었다 도는 모양"(안쪽)을 서로 다른 주기로 돌려서
// 멈추는 순간 없이 물 흐르듯 움직이게 한다. transform 만 움직여서 폰에서도 가볍다. 동작 줄이기 설정이면 CSS 가 멈춘다.
const ORBS = [
  { c: "var(--orb-1)", w: "56%", h: "68%", l: "4%", t: "12%" },
  { c: "var(--orb-2)", w: "50%", h: "62%", l: "40%", t: "0%" },
  { c: "var(--orb-3)", w: "44%", h: "56%", l: "26%", t: "40%" },
  { c: "var(--orb-4)", w: "38%", h: "50%", l: "60%", t: "34%" },
];

export function Orb() {
  return (
    <div className="orb" aria-hidden="true">
      {ORBS.map((o, i) => (
        <span key={i} className={`orb-flow orb-flow-${i}`} style={{ width: o.w, height: o.h, left: o.l, top: o.t }}>
          <i style={{ background: o.c }} />
        </span>
      ))}
    </div>
  );
}

export function Hero({ chip, meta, title, lead, aside }: { chip: string; meta: string; title: string; lead: ReactNode; aside?: ReactNode }) {
  return (
    <header className="hero">
      <Orb />
      <motion.div className="eyebrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        <span className="chip-step">{chip}</span>
        <span>{meta}</span>
        {aside && <span className="eyebrow-aside">{aside}</span>}
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

// AI에게 붙여넣고 물어볼 수 있게 지금 페이지(또는 노트 전체)를 마크다운으로 복사. 제목 위 줄 오른쪽의 작은 메뉴
export function CopyMenu({ page, os, tool }: { page: string; os: OS; tool: AgentTool | "" }) {
  const { copy, Fallback } = useCopy();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (text: string, done: string) => {
    setOpen(false);
    copy(text, done);
  };

  return (
    <div className="copy-menu" ref={wrap}>
      <button type="button" className="copy-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <CopyIcon />
        복사
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className="copy-pop"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease }}
          >
            <button type="button" role="menuitem" onClick={() => pick(pageMarkdown(page, os, tool), "이 페이지를 복사했어요")}>
              <b>이 페이지</b>
              <span>AI에게 붙여넣고 질문하기 좋게</span>
            </button>
            <button type="button" role="menuitem" onClick={() => pick(allMarkdown(os, tool, page), "노트 전체를 복사했어요")}>
              <b>노트 전체</b>
              <span>모든 단계와 자료를 한 번에</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {Fallback && <div className="copy-fallback">{Fallback}</div>}
    </div>
  );
}

export const CopyIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <rect x="5.25" y="5.25" width="8" height="8" rx="2.2" />
    <path d="M10.75 3.6A1.9 1.9 0 0 0 8.9 2.75H4.6a1.85 1.85 0 0 0-1.85 1.85v4.3c0 .86.58 1.58 1.37 1.8" strokeLinecap="round" />
  </svg>
);
