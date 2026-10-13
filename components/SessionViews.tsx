"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { LIBRARY } from "@/lib/docs";
import { CLUB } from "@/lib/club";
import { CLUB_SESSIONS, CURRENT, SESSIONS, type Session } from "@/lib/sessions";
import { useBoard } from "./board";
import { sessionDone, stepProgress, stepState } from "./summary";
import { CheckPath, Hero, Section, ease } from "./ui";
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

// 세션(소모임 회차) 카드 하나: 제목, 설명, 내 진행, 현황·들어가기 버튼
function SessionCard({ x, s, go, i }: { x: Session; s: Store; go: (id: string) => void; i: number }) {
  // 처음 기본값(last = 첫 단계)만 있으면 아직 시작 안 한 걸로 본다
  const started = sessionDone(s, x) > 0 || (x.steps.some((st) => st.id === s.last) && s.last !== x.steps[0].id);
  return (
    <motion.li className="ses-card" data-now={x === CURRENT ? "1" : "0"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease, delay: 0.12 + i * 0.06 }}>
      <button type="button" className="ses-main" onClick={() => go(x.page)}>
        <span className="ses-top">
          <b>{x.label}</b>
          <span>{[x.dateLabel, x.length].filter(Boolean).join(" · ")}</span>
        </span>
        <span className="ses-title">{x.title}</span>
        <span className="ses-lead">{x.lead}</span>
      </button>
      <div className="ses-foot">
        <Progress s={s} ses={x} />
        <div className="ses-acts">
          <button type="button" className="btn btn-soft btn-sm" onClick={() => go(x.boardPage)}>
            {x.kind === "club" ? "현황" : "제출 현황"}
          </button>
          <button type="button" className="btn btn-ink btn-sm" onClick={() => go(started ? resumeStep(s, x).id : x.page)}>
            {started ? "이어서 하기" : "들어가기"}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export function HomeView({ s, go }: { s: Store; go: (id: string) => void }) {
  let n = 0;
  return (
    <article>
      <Hero
        chip="15기"
        meta="NEXT 개발 세션"
        title="15기 개발 세션"
        lead="세션마다 실습 노트와 제출 현황이 여기 쌓여요. 소모임과 자료실은 세션과 상관없이 언제든 꺼내 보세요."
      />

      <Section i={n++} title="세션">
        <ul className="ses-list">
          {SESSIONS.filter((x) => x.kind === "session")
            .reverse()
            .map((x, i) => (
              <SessionCard key={x.id} x={x} s={s} go={go} i={i} />
            ))}
        </ul>
        <p className="ses-next">다음 세션이 열리면 여기에 이어서 생겨요.</p>
      </Section>

      <Section i={n++} title="소모임">
        <ul className="lib">
          <li>
            <button type="button" onClick={() => go("club")}>
              <span className="lib-t">{CLUB.name}</span>
              <span className="lib-d">{CLUB.tagline}. {CLUB.lead}</span>
              <Arrow />
            </button>
          </li>
        </ul>
      </Section>

      <Section i={n++} title="자료" note="세션과 상관없이 언제든">
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

// 소모임 홈: 목표와 원칙, 회차, 처음 시작하는 순서, 좋은 자료
export function ClubView({ s, go }: { s: Store; go: (id: string) => void }) {
  let n = 0;
  return (
    <article>
      <Hero chip="소모임" meta={CLUB.tagline} title={CLUB.name} lead={CLUB.lead} />

      <Section i={n++} title="세 가지 원칙">
        <ol className="club-rules">
          {CLUB.principles.map((p, i) => (
            <motion.li key={p.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.06 }}>
              <em>{i + 1}</em>
              <b>{p.t}</b>
              <span>{p.d}</span>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section i={n++} title="회차">
        <ul className="ses-list">
          {CLUB_SESSIONS.slice()
            .reverse()
            .map((x, i) => (
              <SessionCard key={x.id} x={x} s={s} go={go} i={i} />
            ))}
        </ul>
      </Section>

      <Section i={n++} title="처음이라면 이 순서로">
        <ol className="numlist">
          <li><span><b>성공 숫자부터.</b> 언제까지 무엇을 몇 건. 중단 기준도 같이 정해요.</span></li>
          <li><span><b>돈 낼 사람이 보이는 아이템 하나.</b> 이미 그 문제에 돈이나 시간을 쓰는 사람이 있는지 봐요.</span></li>
          <li><span><b>만날 사람 5명.</b> 만들기 전에 인터뷰할 사람부터 정해요.</span></li>
          <li><span><b>레포와 팀 규칙.</b> AGENTS.md에 &quot;PRD에 없는 기능은 만들지 않는다&quot;를 적어요.</span></li>
          <li><span><b>근거 칸이 있는 PRD.</b> 근거가 빈 기능은 보류함으로. P0는 3개까지.</span></li>
          <li><span><b>아키텍처는 한 장.</b> 바꾸기 비싼 결정만 오늘, 나머지는 만들면서.</span></li>
          <li><span><b>첫 결제는 손으로.</b> 선결제나 송금으로 먼저 받고, 결제 연동은 돈이 들어온 다음에.</span></li>
        </ol>
        <div className="club-go">
          <button type="button" className="btn btn-soft" onClick={() => go("money-prd")}>
            돈 버는 PRD 쓰는 법
          </button>
          <button type="button" className="btn btn-soft" onClick={() => go("first-steps")}>
            처음 시작하는 순서와 아키텍처
          </button>
        </div>
      </Section>

      <Section i={n++} title="좋은 자료" note="오늘 내용이 여기서 나왔어요">
        <ul className="tools">
          {CLUB.refs.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                <span className="tname">
                  <b>{r.name}</b>
                  <span>{r.d}</span>
                </span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 11L11 5M6 5h5v5" />
                </svg>
              </a>
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
        chip={ses.label}
        meta={[ses.dateLabel, ses.length].filter(Boolean).join(" · ")}
        title={ses.title}
        lead={ses.lead}
      />

      <div className="ses-cta">
        <button type="button" className="btn btn-ink" onClick={() => go(next.id)}>
          {fresh ? `${next.label}부터 시작` : `이어서: ${next.label}`}
        </button>
        <button type="button" className="btn btn-soft" onClick={() => go(ses.boardPage)}>
          {ses.kind === "club" ? "현황" : "제출 현황"}{items ? ` · ${people}명` : ""}
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
                  <span className="dot" data-s={st} style={{ "--p": stepProgress(s, x.id) } as CSSProperties}>
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
        <Section i={n++} title={ses.kind === "club" ? "다음 모임까지" : "과제"} note={ses.kind === "club" ? undefined : ses.assignment.due}>
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
        <button type="button" className="btn btn-soft" onClick={() => go(ses.kind === "club" ? "club" : "home")}>
          {ses.kind === "club" ? "← NE:부자들" : "← 전체 세션"}
        </button>
        <button type="button" className="btn btn-ink" onClick={() => go(next.id)}>
          {next.label} →
        </button>
      </nav>
    </article>
  );
}
