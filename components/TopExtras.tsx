"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchBoard } from "./board";
import { ease } from "./ui";

// 상단바 오른쪽: 실습 단계와 성격이 다른 것들(다 같이 보는 현황, 자료)을 단계 목록에서 떼어 둔다

export const EXTRA_PAGES: [string, string][] = [
  ["guide", "바이브 코딩 가이드"],
  ["refs", "디자인 레퍼런스"],
];

export function BoardButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchBoard()
        .then((x) => alive && setN(x.length))
        .catch(() => {});
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return (
    <button
      type="button"
      className="board-btn"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <span className="live" aria-hidden="true" />
      <span>
        <span className="lg">제출 </span>현황
      </span>
      {n !== null && <b>{n}</b>}
    </button>
  );
}

export function MenuSheet({
  name,
  onName,
  cur,
  go,
  onCopySummary,
}: {
  name: string;
  onName: (v: string) => void;
  cur: string;
  go: (id: string) => void;
  onCopySummary: () => void;
}) {
  const [open, setOpen] = useState(false);
  // 상단바에 backdrop-filter 가 있어서, 그 안에 fixed 로 그리면 화면이 아니라 상단바 기준으로 붙는다. body 로 빼서 그린다
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: string) => {
    setOpen(false);
    go(id);
  };

  return (
    <>
      <button
        type="button"
        className="menu-btn"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7h12M4 13h12" />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="sheet-backdrop"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.div
                  className="sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sheet-title"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.42, ease }}
                >
                  <div className="sheet-h">
                    <div>
                      <h2 id="sheet-title">더 보기</h2>
                      <p>자료, 내 이름, 제출 요약</p>
                    </div>
                    <button
                      type="button"
                      className="sheet-x"
                      aria-label="닫기"
                      onClick={() => setOpen(false)}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>

                  <div className="sheet-sec">자료</div>
                  <ul className="sheet-list">
                    {EXTRA_PAGES.map(([id, label]) => (
                      <li key={id}>
                        <button
                          type="button"
                          aria-current={cur === id ? "page" : undefined}
                          onClick={() => pick(id)}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="sheet-sec">내 이름</div>
                  <input
                    className="field sheet-name"
                    value={name}
                    onChange={(e) => onName(e.target.value)}
                    placeholder="본명"
                    autoComplete="name"
                    aria-label="내 이름"
                  />

                  <button
                    type="button"
                    className="btn btn-ink sheet-copy"
                    onClick={() => {
                      onCopySummary();
                      setOpen(false);
                    }}
                  >
                    제출 요약 복사
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
