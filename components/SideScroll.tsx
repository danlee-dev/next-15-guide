"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// 데스크톱 사이드바 스크롤. 기본 스크롤바는 숨기고, 사이드바와 본문 사이 빈 칸에 얇은 위치 막대를 따로 그린다
// (기본 스크롤바가 시간 글자와 겹쳐 보여서). 막대는 마우스를 올리거나 스크롤할 때만 나타난다.
// 페이지가 바뀌면 지금 항목이 보이는 곳까지 사이드바만 굴린다 (창은 안 움직임).
export default function SideScroll({ cur, children }: { cur: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState({ can: false, h: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const { scrollHeight: sh, clientHeight: ch, scrollTop: st } = el;
    if (sh <= ch + 1) return setRail((r) => (r.can ? { can: false, h: 0, y: 0 } : r));
    const h = Math.max(28, (ch * ch) / sh);
    const y = (st / (sh - ch)) * (ch - h);
    setRail({ can: true, h, y });
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const el = box.current;
    const item = el?.querySelector<HTMLElement>('.navitem[aria-current="page"]');
    if (!el || !item || el.scrollHeight <= el.clientHeight) return;
    const top = item.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    if (top < el.scrollTop + 8) el.scrollTo({ top: top - 48, behavior: "smooth" });
    else if (top + item.offsetHeight > el.scrollTop + el.clientHeight - 8) el.scrollTo({ top: top + item.offsetHeight - el.clientHeight + 48, behavior: "smooth" });
  }, [cur]);

  const onScroll = () => {
    measure();
    setMoving(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setMoving(false), 900);
  };

  return (
    <>
      <div className="side-scroll" ref={box} onScroll={onScroll}>
        <div>{children}</div>
      </div>
      {rail.can && (
        <div className="side-rail" data-moving={moving ? "1" : "0"} aria-hidden="true">
          <i style={{ height: rail.h, transform: `translateY(${rail.y}px)` }} />
        </div>
      )}
    </>
  );
}
