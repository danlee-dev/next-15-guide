"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ease } from "./ui";

// 캡처를 누르면 크게 보는 창. 바깥이나 X를 누르거나 Esc 로 닫고, 여러 장이면 좌우 버튼·방향키로 넘긴다.
// 페이지 전환 애니메이션(transform) 안에서는 fixed 가 화면 기준이 안 되므로 body 로 빼서 그린다.

export type LightItem = { src: string; alt: string; cap: string; w: number; h: number };

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "l" ? "M10 3.5L5.5 8l4.5 4.5" : "M6 3.5L10.5 8 6 12.5"} />
  </svg>
);

function Viewer({ items, index, onClose, onMove }: { items: LightItem[]; index: number; onClose: () => void; onMove: (d: number) => void }) {
  const it = items[index];
  const many = items.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (many && e.key === "ArrowLeft") onMove(-1);
      if (many && e.key === "ArrowRight") onMove(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [many, onClose, onMove]);

  return (
    <motion.div className="lb" role="dialog" aria-modal="true" aria-label={it.alt} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
      <motion.figure
        key={it.src}
        className="lb-fig"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.32, ease }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lb-img" src={it.src} alt={it.alt} width={it.w} height={it.h} />
        <figcaption>
          {it.cap}
          {many && (
            <span className="lb-count">
              {index + 1} / {items.length}
            </span>
          )}
        </figcaption>
      </motion.figure>
      <button type="button" className="lb-btn lb-x" aria-label="닫기" onClick={onClose}>
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      {many && (
        <>
          <button type="button" className="lb-btn lb-nav lb-prev" aria-label="이전" onClick={(e) => (e.stopPropagation(), onMove(-1))}>
            <Chevron dir="l" />
          </button>
          <button type="button" className="lb-btn lb-nav lb-next" aria-label="다음" onClick={(e) => (e.stopPropagation(), onMove(1))}>
            <Chevron dir="r" />
          </button>
        </>
      )}
    </motion.div>
  );
}

// 썸네일들을 그리는 쪽은 render(열기 함수)를 받아 자기 모양대로 그린다
export function Lightbox({ items, children }: { items: LightItem[]; children: (open: (i: number) => void) => ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const close = () => setIndex(null);
  const move = (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length));
  return (
    <>
      {children(setIndex)}
      {mounted && createPortal(<AnimatePresence>{index !== null && <Viewer items={items} index={index} onClose={close} onMove={move} />}</AnimatePresence>, document.body)}
    </>
  );
}

export const ZoomHint = () => (
  <span className="zoom-hint" aria-hidden="true">
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9" />
    </svg>
    크게 보기
  </span>
);
