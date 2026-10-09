"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { TOOL_LABEL, tailor, type AgentTool, type OS } from "@/lib/content";
import { DOCS, DOC_MAP } from "@/lib/docs";
import { CURRENT, SESSIONS, sessionOf, type Session } from "@/lib/sessions";
import { CheckPath, ToastProvider, ease, useToast } from "./ui";
import StepView from "./StepView";
import GuideView from "./GuideView";
import RefsView from "./RefsView";
import BoardView from "./BoardView";
import DocView, { LibraryView } from "./DocView";
import { HomeView, SessionView } from "./SessionViews";
import SideScroll from "./SideScroll";
import AuthGate from "./AuthGate";
import { supa } from "./supa";
import { boardPayload, postBoard, useBoardLive } from "./board";
import { BoardButton, EXTRA_PAGES, MenuSheet } from "./TopExtras";
import { EMPTY, loadStore, saveStore, type Patch, type Store } from "./store";
import { sessionDone, stepProgress, stepState } from "./summary";

// 페이지 구조: 홈(세션 목록 + 자료) → 세션(개요, 단계들, 제출 현황). 자료는 세션 밖에 따로 있다.
// 주소는 #페이지id 하나. Session 8 단계와 현황은 예전 주소(#setup, #board)를 그대로 쓴다.
const ALL_STEPS = SESSIONS.flatMap((x) => x.steps);
const PAGES = new Set([
  "home",
  ...SESSIONS.flatMap((x) => [x.page, x.boardPage, ...x.steps.map((st) => st.id)]),
  "guide",
  "refs",
  "library",
  ...DOCS.map((d) => d.id),
]);
const isStep = (id: string) => ALL_STEPS.some((x) => x.id === id);

const ToolMark = ({ t }: { t: AgentTool }) => (
  <Image src={t === "claude" ? "/refs/logos/claude.svg" : "/refs/logos/codex-mark.png"} alt="" width={20} height={20} className="tool-ic" />
);

export default function Notebook() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

function App() {
  const [s, setS] = useState<Store>(EMPTY);
  const [ready, setReady] = useState(false);
  // 구글 로그인이 끝나고 이름까지 정해졌는지. 그 전에는 현황판에 아무것도 올리지 않는다
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toast = useToast();

  // 처음 열 때: 브라우저에 저장된 노트 + 주소의 #페이지
  useEffect(() => {
    const loaded = loadStore();
    const hash = location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS(PAGES.has(hash) ? { ...loaded, cur: hash } : PAGES.has(loaded.cur) ? loaded : { ...loaded, cur: "home" });
    setReady(true);
    const onHash = () => {
      const h = location.hash.slice(1) || "home";
      if (PAGES.has(h)) setS((st) => (st.cur === h ? st : { ...st, last: isStep(st.cur) ? st.cur : st.last, cur: h }));
    };
    const onScroll = () => setScrolled(window.scrollY > 4);
    addEventListener("hashchange", onHash);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("hashchange", onHash);
      removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (ready) saveStore(s);
  }, [s, ready]);

  // 이름을 적은 뒤부터 내 진행 상황(이름, 단계, 막힘, 링크)을 지금 세션 현황판에 자동으로 올린다. 1.5초씩 모아서 보낸다
  const syncBody = ready && authed && s.name.trim() ? JSON.stringify(boardPayload(s)) : "";
  useEffect(() => {
    if (!syncBody) return;
    const t = setTimeout(() => postBoard(syncBody).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [syncBody]);

  const patch: Patch = useCallback((fn) => setS((st) => fn(st)), []);

  const go = useCallback((id: string) => {
    setS((st) => (st.cur === id ? st : { ...st, last: isStep(st.cur) ? st.cur : st.last, cur: id }));
    if (location.hash.slice(1) !== id) history.pushState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 다른 사람이 제출하면 위쪽에 잠깐 알림 (내 제출은 빼고)
  const [notice, setNotice] = useState<{ name: string; ses: Session | null; at: number } | null>(null);
  useBoardLive((name, ses) => {
    if (name.trim() && name.trim() !== s.name.trim()) setNotice({ name, ses, at: Date.now() });
  });
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const logout = () => {
    supa().auth.signOut();
    patch((st) => ({ ...st, name: "" }));
  };

  const setOS = (os: OS) => {
    if (os === s.os) return;
    patch((st) => ({ ...st, os, osPicked: true }));
    toast(os === "win" ? "Windows 명령어로 바꿨어요" : "macOS 명령어로 바꿨어요");
  };

  const setTool = (tool: AgentTool) => {
    if (tool === s.tool) return;
    patch((st) => ({ ...st, tool }));
    toast(`${TOOL_LABEL[tool]} 기준으로 바꿨어요`);
  };

  // 지금 보고 있는 세션 (자료·홈이면 null)
  const ses = sessionOf(s.cur);
  // {{Claude Code|Codex}} 표시를 고른 도구에 맞춘 단계
  const rawStep = ALL_STEPS.find((x) => x.id === s.cur);
  const step = useMemo(() => (rawStep ? tailor(rawStep, s.tool) : undefined), [rawStep, s.tool]);
  const doc = DOC_MAP[s.cur];
  const boardOf = SESSIONS.find((x) => x.boardPage === s.cur);
  const overviewOf = SESSIONS.find((x) => x.page === s.cur);

  const navItem = (id: string, label: string, extra?: ReactNode, cls = "") => {
    const active = s.cur === id;
    return (
      <li key={id} className={cls}>
        <button type="button" className="navitem" aria-current={active ? "page" : undefined} onClick={() => go(id)}>
          {active && <motion.span layoutId="nav-hl" className="hl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
          {extra}
          <span className="lbl">{label}</span>
        </button>
      </li>
    );
  };

  return (
    <>
      <header className="top" data-scrolled={scrolled ? "1" : "0"}>
        <div className="top-in">
          <button type="button" className="brand" onClick={() => go("home")} aria-label="15기 개발 세션 홈">
            <Image src="/next-logo-ink.png" alt="NEXT" width={407} height={96} className="logo" priority />
            <span>15기 개발 세션</span>
          </button>
          <div className="grow" />
          <div className="namebox">
            <label htmlFor="who">이름</label>
            <input id="who" value={s.name} placeholder="입력" onChange={(e) => patch((st) => ({ ...st, name: e.target.value }))} autoComplete="off" />
          </div>
          <div className="seg" role="group" aria-label="운영체제">
            {(["mac", "win"] as const).map((os) => (
              <button key={os} type="button" aria-pressed={s.os === os} onClick={() => setOS(os)}>
                {s.os === os && <motion.span layoutId="os-thumb" className="thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                {os === "mac" ? "macOS" : "Windows"}
              </button>
            ))}
          </div>
          <div className="seg tool-seg" role="group" aria-label="주로 쓰는 AI 도구">
            {(["claude", "codex"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={s.tool === t} onClick={() => setTool(t)} aria-label={TOOL_LABEL[t]} title={TOOL_LABEL[t]}>
                {s.tool === t && <motion.span layoutId="tool-thumb" className="thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <ToolMark t={t} />
              </button>
            ))}
          </div>
          {/* 제출 현황은 세션마다 따로라서, 세션 안에 있을 때만 그 세션 것을 보여 준다. 홈에서는 세션 카드에서 들어간다 */}
          {ses && <BoardButton sid={ses.id} active={s.cur === ses.boardPage} onClick={() => go(ses.boardPage)} />}
          <MenuSheet onLogout={logout} name={s.name} onName={(v) => patch((st) => ({ ...st, name: v }))} tool={s.tool} onTool={setTool} cur={s.cur} go={go} />
        </div>
      </header>

      <AnimatePresence>
        {notice && (
          <motion.button
            key={notice.at}
            type="button"
            className="live-note"
            role="status"
            initial={{ opacity: 0, y: -14, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.4, ease }}
            onClick={() => {
              setNotice(null);
              go((notice.ses || CURRENT).boardPage);
            }}
          >
            <i className="live-face" aria-hidden="true">
              {notice.name.trim().slice(0, 1)}
            </i>
            <span>
              <b>{notice.name}</b>님이 {notice.ses && notice.ses !== ses ? `Session ${notice.ses.no}에 ` : ""}제출했어요
            </span>
            <span className="live-go">보기</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="shell">
        <aside className="side">
          <SideScroll cur={s.cur}>
            <LayoutGroup id="nav">
              {ses ? (
                <>
                  <button type="button" className="side-back" onClick={() => go("home")}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 3.5L5.5 8l4.5 4.5" />
                    </svg>
                    전체 세션
                  </button>
                  <div className="side-ses">
                    <span>
                      Session {ses.no} · {ses.dateLabel}
                    </span>
                    <b>{ses.title}</b>
                  </div>
                  <div className="progress">
                    <div className="row">
                      <span>진행</span>
                      <b>
                        {sessionDone(s, ses)} / {ses.steps.length}
                      </b>
                    </div>
                    <div className="track">
                      <motion.div className="fill" initial={false} animate={{ scaleX: sessionDone(s, ses) / ses.steps.length }} transition={{ duration: 0.8, ease }} />
                    </div>
                  </div>
                  <div className="navgroups">
                    <div className="navgroup">
                      <ul className="navlist">
                        {navItem("home", "전체", undefined, "nav-back-m")}
                        {navItem(ses.page, "개요")}
                        {ses.steps.map((x) => {
                          const st = stepState(s, x.id);
                          const active = s.cur === x.id;
                          return (
                            <li key={x.id}>
                              <button type="button" className="navitem" aria-current={active ? "page" : undefined} onClick={() => go(x.id)}>
                                {active && <motion.span layoutId="nav-hl" className="hl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                                <span className="dot" data-s={st} style={{ "--p": stepProgress(s, x.id) } as CSSProperties}>
                                  <CheckPath on={st === "done"} color="#ffffff" />
                                </span>
                                <span className="lbl">{x.label}</span>
                                <span className="time">{x.start}</span>
                              </button>
                            </li>
                          );
                        })}
                        {navItem(ses.boardPage, "제출 현황")}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="navgroups">
                  <div className="navgroup">
                    <h4>세션</h4>
                    <ul className="navlist">
                      {navItem("home", "전체 세션")}
                      {[...SESSIONS].reverse().map((x) =>
                        navItem(
                          x.page,
                          `Session ${x.no}`,
                          <span className="dot" data-s={sessionDone(s, x) === x.steps.length ? "done" : sessionDone(s, x) ? "part" : "todo"} style={{ "--p": sessionDone(s, x) / x.steps.length } as CSSProperties}>
                            <CheckPath on={sessionDone(s, x) === x.steps.length} color="#ffffff" />
                          </span>,
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="navgroup">
                    <h4>자료</h4>
                    <ul className="navlist">{EXTRA_PAGES.map(([id, label]) => navItem(id, label))}</ul>
                  </div>
                </div>
              )}
            </LayoutGroup>
            {authed && (
              <div className="side-me">
                <span>{s.name}</span>
                <button type="button" className="textlink" onClick={logout}>
                  로그아웃
                </button>
              </div>
            )}
          </SideScroll>
        </aside>

        <main className="page">
          {ready && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={s.cur} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease }}>
                {step ? (
                  <StepView step={step} s={s} patch={patch} go={go} />
                ) : boardOf ? (
                  <BoardView s={s} ses={boardOf} go={go} />
                ) : overviewOf ? (
                  <SessionView ses={overviewOf} s={s} go={go} />
                ) : s.cur === "guide" ? (
                  <GuideView s={s} patch={patch} go={go} />
                ) : s.cur === "refs" ? (
                  <RefsView s={s} go={go} />
                ) : doc ? (
                  <DocView doc={doc} s={s} go={go} />
                ) : s.cur === "library" ? (
                  <LibraryView s={s} go={go} />
                ) : (
                  <HomeView s={s} go={go} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {ready && (
        <AuthGate
          tool={s.tool}
          onReady={(name, tool) => {
            patch((st) => ({ ...st, name, tool }));
            setAuthed(true);
          }}
          onSignedOut={() => setAuthed(false)}
        />
      )}
    </>
  );
}
