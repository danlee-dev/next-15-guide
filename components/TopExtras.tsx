"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TOOL_LABEL, type AgentTool } from "@/lib/content";
import { useBoard } from "./board";
import { ease } from "./ui";

// 상단바 오른쪽: 실습 단계와 성격이 다른 것들(다 같이 보는 현황, 자료)을 단계 목록에서 떼어 둔다

// 자료 메뉴 순서. 자료실 페이지의 "이전/다음"도 이 순서를 따른다
export const EXTRA_PAGES: [string, string][] = [
  ["library", "자료실"],
  ["ai", "AI 이해하기"],
  ["arch", "아키텍처"],
  ["env", "개발 환경 세팅"],
  ["mcp", "MCP 연결"],
  ["deploy", "배포·DB"],
  ["guide", "바이브 코딩 가이드"],
  ["refs", "디자인 레퍼런스"],
  ["design", "디자인 디테일"],
  ["money-prd", "돈 버는 PRD 쓰는 법"],
  ["first-steps", "처음 시작하는 순서"],
];

// 깜빡이는 "live" 점 대신, 들어온 사람들 이름 첫 글자를 겹쳐 보여 준다 (최근에 움직인 사람부터 3명)
export function BoardButton({ sid, active, onClick, club = false }: { sid: string; active: boolean; onClick: () => void; club?: boolean }) {
  const { items } = useBoard(sid);
  const seen = new Set<string>();
  const names = items
    ? items
        .slice()
        .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
        .map((i) => i.name)
        .filter((nm) => (seen.has(nm) ? false : (seen.add(nm), true)))
    : null;
  return (
    <button type="button" className="board-btn" aria-current={active ? "page" : undefined} onClick={onClick} aria-label={`${club ? "" : "제출 "}현황${names ? `, ${names.length}명` : ""}`}>
      {names && names.length > 0 && (
        <span className="faces" aria-hidden="true">
          {names.slice(0, 3).map((nm, i) => (
            <i key={nm} data-i={i}>
              {nm.trim().slice(0, 1)}
            </i>
          ))}
        </span>
      )}
      <span>
        {!club && <span className="lg">제출 </span>}현황
      </span>
      {names && <b>{names.length}</b>}
    </button>
  );
}

export function MenuSheet({
  onLogout,
  name,
  onName,
  cur,
  go,
  tool,
  onTool,
}: {
  onLogout: () => void;
  name: string;
  onName: (v: string) => void;
  cur: string;
  go: (id: string) => void;
  tool: AgentTool | "";
  onTool: (t: AgentTool) => void;
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
                      <p>세션, 자료, 도구, 내 이름</p>
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

                  <ul className="sheet-list">
                    <li>
                      <button type="button" aria-current={cur === "home" ? "page" : undefined} onClick={() => pick("home")}>
                        전체 세션
                      </button>
                    </li>
                    <li>
                      <button type="button" aria-current={cur === "club" ? "page" : undefined} onClick={() => pick("club")}>
                        소모임 NE:부자들
                      </button>
                    </li>
                  </ul>

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

                  <div className="sheet-sec">주로 쓰는 AI 도구</div>
                  <div className="seg sheet-seg" role="group" aria-label="주로 쓰는 AI 도구">
                    {(["claude", "codex"] as const).map((t) => (
                      <button key={t} type="button" aria-pressed={tool === t} onClick={() => onTool(t)}>
                        {tool === t && <span className="thumb" />}
                        {TOOL_LABEL[t]}
                      </button>
                    ))}
                  </div>

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
                className="btn btn-ghost sheet-logout"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
              >
                로그아웃
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
