"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "./ui";

// 가이드 섹션마다 붙는 작은 그림. 글로 설명한 걸 "실제로 생긴 모양"으로 한 번 더 보여 준다.

export type ArtKind = "prd" | "design" | "loop" | "stuck" | "safe";

const Check = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.4l2.9 2.9 6.1-6.6" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

function Rise({ children, d = 0, className }: { children: ReactNode; d?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease, delay: d }}
    >
      {children}
    </motion.div>
  );
}

function Prd() {
  return (
    <div className="art art-prd">
      <Rise className="paper">
        <div className="paper-file">docs/PRD.md</div>
        <div className="paper-title">팀메이트</div>
        <dl>
          <dt>문제</dt>
          <dd>
            <mark>해커톤 직전에 팀을 못 구해서 포기한다</mark>
          </dd>
          <dt>P0</dt>
          <dd className="chips">
            <span>프로필 카드</span>
            <span>역할 매칭</span>
            <span>팀 요청</span>
            <em>3개까지</em>
          </dd>
          <dt>안 만드는 것</dt>
          <dd className="muted">로그인 · 결제 · 채팅</dd>
          <dt>완료 기준</dt>
          <dd className="ok">
            <Check />
            버튼 누르고 30초 안에 카드가 뜬다
          </dd>
        </dl>
      </Rise>
      <Rise className="bubble" d={0.15}>
        <div className="bubble-who">AI가 먼저 질문</div>
        <p>쓰기 전에 세 가지만 물어볼게요. 누가 쓰나요? 24시간 안에 꼭 보여줄 화면은 뭔가요? 이번에 빼도 되는 건요?</p>
      </Rise>
    </div>
  );
}

function Design() {
  const bad = ["이모지 아이콘", "보라 그라데이션", "카드마다 그림자", "가운데 정렬만", "\"예쁘게 해 줘\""];
  const good = ["DESIGN.md", "레퍼런스 스크린샷 3장", "shadcn/ui 부품", "금지 목록", "한 번에 한 화면"];
  return (
    <div className="art art-design">
      <Rise className="col">
        <div className="col-h">이렇게 시키면 다 비슷해져요</div>
        <ul className="tags bad">
          {bad.map((b) => (
            <li key={b}>
              <Cross />
              {b}
            </li>
          ))}
        </ul>
      </Rise>
      <Rise className="col" d={0.12}>
        <div className="col-h">이렇게 기준을 줘요</div>
        <ul className="tags good">
          {good.map((g) => (
            <li key={g}>
              <Check />
              {g}
            </li>
          ))}
        </ul>
      </Rise>
    </div>
  );
}

function Loop() {
  const steps: [string, string, boolean][] = [
    ["계획", "AI", false],
    ["리뷰", "나", true],
    ["실행", "AI", false],
    ["확인", "나", true],
    ["커밋", "나", true],
  ];
  return (
    <div className="art art-loop">
      <ol className="loop">
        {steps.map(([t, who, human], i) => (
          <motion.li
            key={t}
            data-human={human ? "1" : "0"}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.08 }}
          >
            <b>{t}</b>
            <span>{who}</span>
          </motion.li>
        ))}
      </ol>
      <div className="loop-back">
        <span>다음 Step으로 한 바퀴 더</span>
      </div>
      <p className="art-cap">검은 칸이 사람이 하는 일이에요. AI가 아무리 빨라도 리뷰와 확인은 건너뛰지 않아요.</p>
    </div>
  );
}

function Stuck() {
  return (
    <div className="art art-stuck">
      <Rise className="term">
        <div className="term-bar">
          <i />
          <i />
          <i />
          <span>터미널</span>
        </div>
        <pre>
          <span className="dim">$ npm run dev</span>
          {"\n"}POST /api/specs 500
          {"\n"}
          <span className="err">Error: permission denied for table specs</span>
          {"\n\n"}
          <span className="dim"># 같은 시도가 두 번 실패하면 멈추고</span>
          {"\n"}$ git status
          {"\n"}$ git diff
          {"\n"}$ git restore .
        </pre>
      </Rise>
      <Rise className="bubble me" d={0.15}>
        <div className="bubble-who">AI에게 보낼 말</div>
        <p>아래 에러가 났다. 고치기 전에 원인부터 설명해. 어느 파일 몇 번째 줄인지. 그다음 최소로만 고쳐.</p>
      </Rise>
    </div>
  );
}

function Safe() {
  return (
    <div className="art art-safe">
      <Rise className="env">
        <div className="env-name">.env.local</div>
        <code>OPENAI_API_KEY=sk-••••</code>
        <code>SUPABASE_SECRET_KEY=sb_secret_••••</code>
      </Rise>
      <div className="flows">
        <Rise className="flow ok" d={0.1}>
          <span className="flow-ic">
            <Check />
          </span>
          <div>
            <b>서버 코드</b>
            <span>app/api/**/route.ts, lib/openai.ts</span>
          </div>
        </Rise>
        <Rise className="flow no" d={0.2}>
          <span className="flow-ic">
            <Cross />
          </span>
          <div>
            <b>브라우저 코드</b>
            <span>&quot;use client&quot; 파일, NEXT_PUBLIC_ 붙은 변수는 누구나 열어 봐요</span>
          </div>
        </Rise>
      </div>
    </div>
  );
}

export default function GuideArt({ kind }: { kind: ArtKind }) {
  if (kind === "prd") return <Prd />;
  if (kind === "design") return <Design />;
  if (kind === "loop") return <Loop />;
  if (kind === "stuck") return <Stuck />;
  return <Safe />;
}
