"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { STEPS, type OS } from "@/lib/content";
import { CheckPath, ToastProvider, ease, useCopy, useToast } from "./ui";
import StepView from "./StepView";
import GuideView from "./GuideView";
import RefsView from "./RefsView";
import BoardView from "./BoardView";
import NameGate from "./NameGate";
import { boardPayload, postBoard } from "./board";
import { EMPTY, loadStore, saveStore, type Patch, type Store } from "./store";
import { stepState, summaryText } from "./summary";

const PAGES = new Set([...STEPS.map((s) => s.id), "board", "guide", "refs"]);

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
  const [gate, setGate] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toast = useToast();
  const { copy } = useCopy();

  // 처음 열 때: 브라우저에 저장된 노트 + 주소의 #단계
  useEffect(() => {
    const loaded = loadStore();
    const hash = location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS(PAGES.has(hash) ? { ...loaded, cur: hash } : loaded);
    setGate(!loaded.name.trim());
    setReady(true);
    const onHash = () => {
      const h = location.hash.slice(1);
      if (PAGES.has(h)) setS((st) => (st.cur === h ? st : { ...st, last: STEPS.some((x) => x.id === st.cur) ? st.cur : st.last, cur: h }));
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

  // 이름을 적은 뒤부터 내 진행 상황(이름, 단계, 막힘, 링크)을 제출 현황판에 자동으로 올린다. 1.5초씩 모아서 보낸다
  const syncBody = ready && !gate && s.name.trim() ? JSON.stringify(boardPayload(s)) : "";
  useEffect(() => {
    if (!syncBody) return;
    const t = setTimeout(() => postBoard(syncBody).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [syncBody]);

  const patch: Patch = useCallback((fn) => setS((st) => fn(st)), []);

  const go = useCallback(
    (id: string) => {
      setS((st) => (st.cur === id ? st : { ...st, last: STEPS.some((x) => x.id === st.cur) ? st.cur : st.last, cur: id }));
      if (location.hash.slice(1) !== id) history.pushState(null, "", `#${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const setOS = (os: OS) => {
    if (os === s.os) return;
    patch((st) => ({ ...st, os, osPicked: true }));
    toast(os === "win" ? "Windows 명령어로 바꿨어요" : "macOS 명령어로 바꿨어요");
  };

  const done = STEPS.filter((x) => stepState(s, x.id) === "done").length;
  const step = STEPS.find((x) => x.id === s.cur);

  return (
    <>
      <header className="top" data-scrolled={scrolled ? "1" : "0"}>
        <div className="top-in">
          <div className="brand">
            <Image src="/next-logo-ink.png" alt="NEXT" width={407} height={96} className="logo" priority />
            <span>Session 8 실습 노트</span>
          </div>
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
          <button type="button" className="btn btn-soft btn-sm sum" onClick={() => copy(summaryText(s), "제출 요약을 복사했어요")}>
            제출 요약 복사
          </button>
        </div>
      </header>

      <div className="shell">
        <aside className="side">
          <div className="progress">
            <div className="row">
              <span>진행</span>
              <b>
                {done} / {STEPS.length}
              </b>
            </div>
            <div className="track">
              <motion.div className="fill" initial={false} animate={{ scaleX: done / STEPS.length }} transition={{ duration: 0.8, ease }} />
            </div>
          </div>
          <LayoutGroup id="nav">
            <div className="navgroups">
              <div className="navgroup">
                <h4>실습</h4>
                <ul className="navlist">
                  {STEPS.map((x) => {
                    const st = stepState(s, x.id);
                    const active = s.cur === x.id;
                    return (
                      <li key={x.id}>
                        <button type="button" className="navitem" aria-current={active ? "page" : undefined} onClick={() => go(x.id)}>
                          {active && <motion.span layoutId="nav-hl" className="hl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                          <span className="dot" data-s={st}>
                            <CheckPath on={st === "done"} color="#ffffff" />
                          </span>
                          <span className="lbl">{x.label}</span>
                          <span className="time">{x.start}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="navgroup">
                <h4>현황</h4>
                <ul className="navlist">
                  <li>
                    <button type="button" className="navitem" aria-current={s.cur === "board" ? "page" : undefined} onClick={() => go("board")}>
                      {s.cur === "board" && <motion.span layoutId="nav-hl" className="hl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                      <span className="lbl">제출 현황</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div className="navgroup">
                <h4>더 보기</h4>
                <ul className="navlist">
                  {[
                    ["guide", "바이브 코딩 가이드"],
                    ["refs", "디자인 레퍼런스"],
                  ].map(([id, label]) => {
                    const active = s.cur === id;
                    return (
                      <li key={id}>
                        <button type="button" className="navitem" aria-current={active ? "page" : undefined} onClick={() => go(id)}>
                          {active && <motion.span layoutId="nav-hl" className="hl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                          <span className="lbl">{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </LayoutGroup>
        </aside>

        <main className="page">
          {ready && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.cur}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease }}
              >
                {step ? (
                  <StepView step={step} s={s} patch={patch} go={go} />
                ) : s.cur === "board" ? (
                  <BoardView s={s} go={go} />
                ) : s.cur === "guide" ? (
                  <GuideView s={s} patch={patch} go={go} />
                ) : (
                  <RefsView s={s} go={go} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <AnimatePresence>
        {gate && (
          <NameGate
            onDone={(name) => {
              patch((st) => ({ ...st, name }));
              setGate(false);
              toast(`${name}님, 반가워요`);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
