"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TOOL_LABEL, tailor, type AgentTool, type OS } from "@/lib/content";
import { DOCS, DOC_MAP, LIBRARY } from "@/lib/docs";
import { CLUB_SESSIONS, CURRENT, SESSIONS, sessionOf, type Session } from "@/lib/sessions";
import { CheckPath, ToastProvider, ease, useToast } from "./ui";
import StepView from "./StepView";
import GuideView from "./GuideView";
import RefsView from "./RefsView";
import BoardView from "./BoardView";
import PrdView from "./PrdView";
import DocView, { LibraryView } from "./DocView";
import { ClubView, HomeView, SessionView } from "./SessionViews";
import SideScroll from "./SideScroll";
import AuthGate from "./AuthGate";
import { supa } from "./supa";
import { boardPayload, fetchMe, postBoard, useBoardLive } from "./board";
import { focusPrd } from "./prd";
import { fetchNotebook, mergeOnLogin, saveNotebook, setSynced, syncedPart } from "./notebookSync";
import { BoardButton, CLUB_PAGES, MenuSheet } from "./TopExtras";
import { EMPTY, loadStore, saveStore, type Patch, type Store } from "./store";
import { sessionDone, stepProgress, stepState } from "./summary";

// 페이지 구조: 홈(세션 목록 + 자료) → 세션(개요, 단계들, 제출 현황). 자료는 세션 밖에 따로 있다.
// 주소는 #페이지id 하나. Session 8 단계와 현황은 예전 주소(#setup, #board)를 그대로 쓴다.
const ALL_STEPS = SESSIONS.flatMap((x) => x.steps);
const PAGES = new Set([
  "home",
  ...SESSIONS.flatMap((x) => [x.page, x.boardPage, ...(x.prdPage ? [x.prdPage] : []), ...x.steps.map((st) => st.id)]),
  "guide",
  "refs",
  "library",
  "club",
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
  // 로그인 뒤 Supabase 에 저장된 내 노트를 불러왔는지. 불러오기 전에는 아무것도 서버에 올리지 않는다
  const [hydrated, setHydrated] = useState(false);
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

  // 노트 전체(체크, 답, 튜터 대화, 제출 링크)를 계정별로 Supabase 에 저장한다. 1.5초씩 모아서 보내고,
  // 실패하면 5초 뒤 다시 보낸다. 사이드바에 저장 상태를 보여 준다
  const [sync, setSync] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const [retry, setRetry] = useState(0);
  const nbBody = ready && authed && hydrated ? JSON.stringify({ data: syncedPart(s) }) : "";
  const lastSaved = useRef("");
  useEffect(() => {
    if (!nbBody || nbBody === lastSaved.current) return;
    const t = setTimeout(async () => {
      setSync("saving");
      try {
        setSynced(await saveNotebook(nbBody));
        lastSaved.current = nbBody;
        setSync("saved");
      } catch {
        setSync("error");
        setTimeout(() => setRetry((n) => n + 1), 5000);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [nbBody, retry]);
  // 창을 닫거나 다른 앱으로 넘어갈 때 아직 안 보낸 게 있으면 바로 보낸다
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden" && nbBody && nbBody !== lastSaved.current) saveNotebook(nbBody, true).then(setSynced).catch(() => {});
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [nbBody]);

  // 로그인 직후: 서버 노트를 불러와 이 브라우저 노트와 칸별로 합친다 (주소나 기기가 바뀌어도 이어지게).
  // 불러오기에 실패하면 저장을 시작하지 않고 다시 시도한다 (빈 노트로 서버 노트를 덮지 않게)
  const hydrate = useCallback(async (name: string, tool: AgentTool, uid: string) => {
    setSync("loading");
    for (let i = 0; ; i++) {
      try {
        const server = await fetchNotebook();
        setS((st) => ({ ...mergeOnLogin(st, EMPTY, uid, server), name, tool }));
        if (server.updatedAt) setSynced(server.updatedAt);
        setAuthed(true);
        setHydrated(true);
        setSync("saved");
        return;
      } catch {
        setSync("error");
        await new Promise((r) => setTimeout(r, Math.min(15000, 2000 * (i + 1))));
      }
    }
  }, []);

  // 이름을 적은 뒤부터 내 진행 상황(이름, 단계, 막힘)을 지금 세션 현황판에 자동으로 올린다. 제출 링크는 제출 버튼으로만 바뀐다
  // 올리는 현황판은 지금 보고 있는 세션(소모임 회차) 것. 홈·자료에 있을 때는 올리지 않는다
  const syncSes = sessionOf(s.cur);
  const syncBody = ready && authed && hydrated && s.name.trim() && syncSes ? JSON.stringify(boardPayload(s, false, syncSes)) : "";
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

  // 운영진(ADMIN_EMAILS)이면 올라온 기획서를 바로 열 수 있다. 판단은 서버가 하고, 여기선 보여 주기만 바꾼다
  const [adminFlag, setAdminFlag] = useState(false);
  useEffect(() => {
    if (!authed) return;
    let alive = true;
    fetchMe()
      .then((m) => alive && setAdminFlag(m.admin))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [authed]);
  const admin = authed && adminFlag;

  // 다른 사람이 제출하면 위쪽에 잠깐 알림 (내 제출은 빼고). 기획서를 올린 거면 운영진은 눌러서 바로 연다
  const [notice, setNotice] = useState<{ name: string; ses: Session | null; at: number; prd?: string; version?: number } | null>(null);
  useBoardLive((name, ses, ev) => {
    if (name.trim() && name.trim() !== s.name.trim()) setNotice({ name, ses, at: Date.now(), prd: ev.prd, version: ev.version });
  });
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.prd ? 9000 : 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // 로그아웃하면 화면의 노트를 비운다 (서버에는 남아 있어서 다시 로그인하면 돌아온다)
  const logout = () => {
    supa().auth.signOut();
    setHydrated(false);
    setAuthed(false);
    patch((st) => ({ ...EMPTY, os: st.os, osPicked: st.osPicked, cur: "home" }));
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
  const prdOf = SESSIONS.find((x) => x.prdPage === s.cur);

  // 세션 목록 옆 진행 링 (그 세션에서 끝낸 단계 비율)
  const sesDot = (x: Session) => {
    const d = sessionDone(s, x);
    return (
      <span className="dot" data-s={d === x.steps.length ? "done" : d ? "part" : "todo"} style={{ "--p": d / x.steps.length } as CSSProperties}>
        <CheckPath on={d === x.steps.length} color="#ffffff" />
      </span>
    );
  };

  const inClub = CLUB_PAGES.some(([id]) => id === s.cur);
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
          {ses && <BoardButton sid={ses.id} club={ses.kind === "club"} active={s.cur === ses.boardPage} onClick={() => go(ses.boardPage)} />}
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
              const target = notice.ses || CURRENT;
              if (notice.prd && admin && target.prdPage) {
                focusPrd(notice.prd);
                go(target.prdPage);
              } else go(target.boardPage);
            }}
          >
            <i className="live-face" aria-hidden="true">
              {notice.name.trim().slice(0, 1)}
            </i>
            <span>
              <b>{notice.name}</b>님이 {notice.ses && notice.ses !== ses ? `${notice.ses.label}에 ` : ""}
              {notice.prd ? `기획서를 올렸어요${notice.version && notice.version > 1 ? ` (v${notice.version})` : ""}` : "제출했어요"}
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
                  <button type="button" className="side-back" onClick={() => go(ses.kind === "club" ? "club" : "home")}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 3.5L5.5 8l4.5 4.5" />
                    </svg>
                    {ses.kind === "club" ? "NE:부자들" : "전체 세션"}
                  </button>
                  <div className="side-ses">
                    <span>
                      {ses.label} · {ses.dateLabel}
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
                        {ses.kind === "club" ? navItem("club", "NE:부자들", undefined, "nav-back-m") : navItem("home", "전체", undefined, "nav-back-m")}
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
                        {ses.prdPage && navItem(ses.prdPage, "PRD 피드백")}
                        {navItem(ses.boardPage, ses.kind === "club" ? "현황" : "제출 현황")}
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
                      {SESSIONS.filter((x) => x.kind === "session").reverse().map((x) => navItem(x.page, x.label, sesDot(x)))}
                    </ul>
                  </div>
                  <div className="navgroup">
                    <h4>소모임</h4>
                    <ul className="navlist">
                      {navItem("club", "NE:부자들")}
                      {CLUB_SESSIONS.map((x) => navItem(x.page, `${x.no}회차`, sesDot(x)))}
                      {/* 소모임 자료는 소모임 화면에 있을 때만 펼친다 (자료실과 섞지 않음) */}
                      {inClub && CLUB_PAGES.slice(1).map(([id, label]) => navItem(id, label))}
                    </ul>
                  </div>
                  {LIBRARY.map((g) => (
                    <div key={g.title} className="navgroup">
                      <h4>{g.title}</h4>
                      <ul className="navlist">{g.items.map((it) => navItem(it.id, it.label))}</ul>
                    </div>
                  ))}
                  <div className="navgroup">
                    <ul className="navlist">{navItem("library", "자료실 전체")}</ul>
                  </div>
                </div>
              )}
            </LayoutGroup>
            {authed && (
              <div className="side-me">
                <span className="side-name">{s.name}</span>
                <button type="button" className="textlink" onClick={logout}>
                  로그아웃
                </button>
                <em className="sync" data-s={sync}>
                  {sync === "saving" ? "저장 중" : sync === "error" ? "저장 안 됨, 다시 시도 중" : sync === "loading" ? "불러오는 중" : "저장됨"}
                </em>
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
                  <BoardView s={s} ses={boardOf} go={go} admin={admin} />
                ) : overviewOf ? (
                  <SessionView ses={overviewOf} s={s} go={go} />
                ) : prdOf ? (
                  <PrdView ses={prdOf} s={s} go={go} />
                ) : s.cur === "guide" ? (
                  <GuideView s={s} patch={patch} go={go} />
                ) : s.cur === "refs" ? (
                  <RefsView s={s} go={go} />
                ) : doc ? (
                  <DocView doc={doc} s={s} go={go} />
                ) : s.cur === "club" ? (
                  <ClubView s={s} go={go} />
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
          onReady={hydrate}
          onSignedOut={() => {
            setAuthed(false);
            setHydrated(false);
          }}
        />
      )}
    </>
  );
}
