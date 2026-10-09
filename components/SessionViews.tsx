"use client";

import { motion } from "motion/react";
import { LIBRARY } from "@/lib/docs";
import { CURRENT, SESSIONS, type Session } from "@/lib/sessions";
import { useBoard } from "./board";
import { sessionDone, stepState } from "./summary";
import { CheckPath, CopyMenu, Hero, Section, ease } from "./ui";
import type { Store } from "./store";

// 첫 화면(세션 목록)과 세션 개요. 세션이 늘면 lib/sessions.ts 에 추가만 하면 여기 같이 뜬다.

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

// 이 세션에서 이어서 할 단계: 마지막으로 본 단계 → 아직 안 끝낸 첫 단계 → 첫 단계
function resumeStep(s: Store, ses: Session) {
  if (ses.steps.some((x) => x.id === s.last) && s.last !== ses.steps[0].id) return ses.steps.find((x) => x.id === s.last)!;
  return ses.steps.find((x) => stepState(s, x.id) !== "done") || ses.steps[0];
}

function Progress({ s, ses }: { s: Store; ses: Session }) {
  const done = sessionDone(s, ses);
  return (
    <div className="ses-prog" aria-label={`${done} / ${ses.steps.length} 단계`}>
      <div className="b-bar">
        <i style={{ transform: `scaleX(${done / ses.steps.length})` }} />
      </div>
      <span>
        {done}/{ses.steps.length}
      </span>
    </div>
  );
}

export function HomeView({ s, go }: { s: Store; go: (id: string) => void }) {
  return (
    <article>
      <Hero
        chip="15기"
        meta="NEXT 개발 세션"
        title="15기 개발 세션"
        lead="세션마다 실습 노트와 제출 현황이 여기 쌓여요. 자료실은 세션과 상관없이 언제든 꺼내 보세요."
        aside={<CopyMenu page="home" os={s.os} tool={s.tool} />}
      />

      <Section i={0} title="세션">
        <ul className="ses-list">
          {[...SESSIONS].reverse().map((x, i) => {
            // 처음 기본값(last = 첫 단계)만 있으면 아직 시작 안 한 걸로 본다
            const started = sessionDone(s, x) > 0 || (x.steps.some((st) => st.id === s.last) && s.last !== x.steps[0].id);
            return (
              <motion.li key={x.id} className="ses-card" data-now={x === CURRENT ? "1" : "0"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease, delay: 0.12 + i * 0.06 }}>
                <button type="button" className="ses-main" onClick={() => go(x.page)}>
                  <span className="ses-top">
                    <b>Session {x.no}</b>
                    <span>
                      {x.dateLabel} · {x.length}
                    </span>
                  </span>
                  <span className="ses-title">{x.title}</span>
                  <span className="ses-lead">{x.lead}</span>
                </button>
                <div className="ses-foot">
                  <Progress s={s} ses={x} />
                  <div className="ses-acts">
                    <button type="button" className="btn btn-soft btn-sm" onClick={() => go(x.boardPage)}>
                      제출 현황
                    </button>
                    <button type="button" className="btn btn-ink btn-sm" onClick={() => go(started ? resumeStep(s, x).id : x.page)}>
                      {started ? "이어서 하기" : "들어가기"}
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
        <p className="ses-next">다음 세션이 열리면 여기에 이어서 생겨요.</p>
      </Section>

      <Section i={1} title="자료" note="세션과 상관없이 언제든">
        <ul className="lib lib-compact">
          {LIBRARY.flatMap((g) => g.items).map((it) => (
            <li key={it.id}>
              <button type="button" onClick={() => go(it.id)}>
                <span className="lib-t">{it.label}</span>
                <span className="lib-d">{it.desc}</span>
                <Arrow />
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}

export function SessionView({ ses, s, go }: { ses: Session; s: Store; go: (id: string) => void }) {
  const done = sessionDone(s, ses);
  const next = resumeStep(s, ses);
  const fresh = done === 0 && !ses.steps.some((x) => x.id === s.last && x.id !== ses.steps[0].id);
  const { items } = useBoard(ses.id);
  const people = new Set((items || []).map((x) => x.name)).size;
  let n = 0;

  return (
    <article>
      <Hero
        chip={`Session ${ses.no}`}
        meta={`${ses.dateLabel} · ${ses.length}`}
        title={ses.title}
        lead={ses.lead}
        aside={<CopyMenu page={ses.page} os={s.os} tool={s.tool} />}
      />

      <div className="ses-cta">
        <button type="button" className="btn btn-ink" onClick={() => go(next.id)}>
          {fresh ? `${next.label}부터 시작` : `이어서: ${next.label}`}
        </button>
        <button type="button" className="btn btn-soft" onClick={() => go(ses.boardPage)}>
          제출 현황{items ? ` · ${people}명` : ""}
        </button>
      </div>

      <Section i={n++} title="오늘 순서" note={`${done}/${ses.steps.length} 끝냄`}>
        <ol className="agenda">
          {ses.steps.map((x) => {
            const st = stepState(s, x.id);
            return (
              <li key={x.id}>
                <button type="button" onClick={() => go(x.id)}>
                  <span className="ag-time">{x.start}</span>
                  <span className="dot" data-s={st}>
                    <CheckPath on={st === "done"} color="#ffffff" />
                  </span>
                  <span className="ag-body">
                    <b>{x.label}</b>
                    <span>{x.title}</span>
                  </span>
                  <Arrow />
                </button>
              </li>
            );
          })}
        </ol>
      </Section>

      {ses.assignment && (
        <Section i={n++} title="과제" note={ses.assignment.due}>
          <ol className="numlist">
            {ses.assignment.items.map((a) => (
              <li key={a.t}>
                <span>
                  <b>{a.t}</b> {a.d}
                </span>
              </li>
            ))}
          </ol>
          <p className="blk-tip">제출: {ses.assignment.submit}</p>
        </Section>
      )}

      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go("home")}>
          ← 전체 세션
        </button>
        <button type="button" className="btn btn-ink" onClick={() => go(next.id)}>
          {next.label} →
        </button>
      </nav>
    </article>
  );
}
