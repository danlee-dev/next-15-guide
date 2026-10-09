"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DocArtKind } from "@/lib/docs";
import { ease } from "./ui";

// 자료실 도식. 글로 쓴 구조를 "실제 생긴 모양"으로 한 번 더 보여 준다. 전부 HTML/CSS라 글자를 고치기 쉽다.

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

const Logo = ({ src }: { src: string }) => <Image className="dlogo" src={src} alt="" width={20} height={20} />;

/* ---------- 모델과 하네스 ---------- */
function Harness() {
  return (
    <div className="art hz">
      <Rise className="hz-world">
        <div className="hz-h">
          <b>바깥 세상</b>
          <span>AI가 도구로 만지는 것</span>
        </div>
        <ul className="hz-chips">
          {["프로젝트 폴더", "터미널", "git", "브라우저", "Supabase · Vercel"].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <Rise className="hz-harness" d={0.1}>
          <div className="hz-h">
            <b>하네스</b>
            <span>Claude Code · Codex</span>
          </div>
          <ul className="hz-chips">
            {["도구: 읽기 · 수정 · 실행 · 검색", "권한", "컨텍스트 관리", "CLAUDE.md · AGENTS.md", "스킬 · 서브에이전트 · 훅 · MCP"].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <Rise className="hz-model" d={0.2}>
            <b>모델</b>
            <span>Claude · GPT</span>
            <p>보이는 글을 읽고, 다음 행동을 고른다</p>
          </Rise>
        </Rise>
      </Rise>
    </div>
  );
}

/* ---------- 에이전트 루프 ---------- */
function Loop() {
  const nodes: [string, string, boolean?][] = [
    ["내 요청", "무엇을, 어디까지", true],
    ["맥락 모으기", "파일 찾고 읽기"],
    ["행동하기", "수정, 명령 실행"],
    ["확인하기", "테스트, 빌드, 에러 읽기"],
  ];
  return (
    <div className="art">
      <ol className="loop">
        {nodes.map(([t, d, me], i) => (
          <motion.li
            key={t}
            data-human={me ? "1" : "0"}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.08 }}
          >
            <b>{t}</b>
            <span>{d}</span>
          </motion.li>
        ))}
      </ol>
      <div className="loop-back loop-back-r">
        <span>다 될 때까지 반복 · 언제든 Esc로 끼어들기</span>
      </div>
    </div>
  );
}

/* ---------- 컨텍스트 창 ---------- */
const CTX: [string, number, string][] = [
  ["시스템 지시", 7, "#1d1d1f"],
  ["CLAUDE.md", 5, "#3a3a3c"],
  ["MCP 도구 이름", 4, "#545458"],
  ["읽은 파일", 30, "#7c7c80"],
  ["명령 결과", 22, "#a1a1a6"],
  ["대화", 20, "#c7c7cc"],
];
function Context() {
  const used = CTX.reduce((a, x) => a + x[1], 0);
  return (
    <div className="art cx">
      <div className="cx-top">
        <b>컨텍스트 창</b>
        <span>모델이 한 번에 볼 수 있는 글의 양</span>
      </div>
      <div className="cx-bar" role="img" aria-label="컨텍스트 창을 채우는 것들">
        {CTX.map(([label, w, c], i) => (
          <motion.i
            key={label}
            style={{ width: `${w}%`, background: c }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.12 }}
          />
        ))}
        <span className="cx-free" style={{ width: `${100 - used}%` }}>
          남은 자리
        </span>
      </div>
      <ul className="cx-legend">
        {CTX.map(([label, , c]) => (
          <li key={label}>
            <i style={{ background: c }} />
            {label}
          </li>
        ))}
      </ul>
      <p className="cx-note">다 차면: 오래된 명령 결과부터 지우고 → 대화를 요약해요. 이때 초반에 한 말이 빠질 수 있어요.</p>
    </div>
  );
}

/* ---------- 전체 구조 ---------- */
const HArrow = ({ label, back }: { label: string; back?: boolean }) => (
  <div className="ax-a" data-back={back ? "1" : "0"}>
    <span>{label}</span>
    <svg viewBox="0 0 60 10" preserveAspectRatio="none" aria-hidden="true">
      {back ? <path d="M58 5H3M8 1L3 5l5 4" /> : <path d="M2 5h55M52 1l5 4-5 4" />}
    </svg>
  </div>
);

function Arch() {
  return (
    <div className="art ax-wrap">
      <div className="ax">
        <Rise className="ax-col">
          <div className="ax-h">사용자 브라우저</div>
          <div className="ax-box">
            <b>화면</b>
            <small>page.tsx · &quot;use client&quot; 컴포넌트</small>
          </div>
          <p className="ax-note">누구나 개발자도구로 열어 볼 수 있어요</p>
        </Rise>
        <div className="ax-arrows">
          <HArrow label="요청" />
          <HArrow label="응답" back />
        </div>
        <Rise className="ax-col ax-server" d={0.1}>
          <div className="ax-h">
            <Logo src="/refs/logos/vercel-cli.png" />
            서버 · Vercel
          </div>
          <div className="ax-box">
            <b>API</b>
            <small>app/api/…/route.ts</small>
          </div>
          <div className="ax-box">
            <b>서버 컴포넌트</b>
            <small>DB에서 읽어 와서 그리기</small>
          </div>
          <div className="ax-key">
            <b>환경 변수</b>
            <small>OPENAI_API_KEY · SUPABASE_SECRET_KEY</small>
          </div>
        </Rise>
        <div className="ax-arrows">
          <HArrow label="키 붙여 호출" />
          <HArrow label="결과" back />
        </div>
        <Rise className="ax-col" d={0.2}>
          <div className="ax-h">외부 서비스</div>
          <div className="ax-box">
            <b>OpenAI</b>
            <small>글 생성 API</small>
          </div>
          <div className="ax-box">
            <b>
              <Logo src="/refs/logos/supabase.svg" />
              Supabase
            </b>
            <small>Postgres DB · 로그인</small>
          </div>
        </Rise>
      </div>
      <p className="ax-dev">
        코드가 올라가는 길: <b>내 노트북</b> → git push → <b>GitHub</b> → <b>Vercel</b>이 빌드해서 서버로 실행
      </p>
    </div>
  );
}

/* ---------- 요청 흐름 (시퀀스) ---------- */
type Msg = { from: number; to: number; t: string; n?: string; ret?: boolean } | { self: number; t: string };
const RF_COLS = ["브라우저", "서버 route.ts", "OpenAI", "Supabase"];
const RF: Msg[] = [
  { from: 0, to: 1, n: "1", t: "POST /api/specs · 아이디어" },
  { self: 1, t: "입력 검증" },
  { from: 1, to: 2, n: "2", t: "프롬프트 + 키" },
  { from: 2, to: 1, t: "PRD JSON", ret: true },
  { from: 1, to: 3, n: "3", t: "저장 + 키" },
  { from: 3, to: 1, t: "저장된 행", ret: true },
  { from: 1, to: 0, n: "4", t: "spec JSON → 카드" },
];
function ReqFlow() {
  return (
    <div className="art rf">
      <div className="rf-grid">
        {RF_COLS.map((c, i) => (
          <div key={c} className="rf-head" data-server={i === 1 ? "1" : "0"} style={{ gridColumn: i + 1 }}>
            {c}
          </div>
        ))}
        {RF_COLS.map((c, i) => (
          <div key={`l-${c}`} className="rf-life" style={{ gridColumn: i + 1, gridRow: `2 / span ${RF.length}` }} aria-hidden="true" />
        ))}
        {RF.map((m, i) => {
          const row = i + 2;
          if ("self" in m)
            return (
              <div key={i} className="rf-self" style={{ gridColumn: m.self + 1, gridRow: row }}>
                <span>{m.t}</span>
              </div>
            );
          const a = Math.min(m.from, m.to);
          const b = Math.max(m.from, m.to);
          const span = b - a + 1;
          return (
            <motion.div
              key={i}
              className="rf-msg"
              data-dir={m.to > m.from ? "r" : "l"}
              data-ret={m.ret ? "1" : "0"}
              style={{ gridColumn: `${a + 1} / ${b + 2}`, gridRow: row, ["--s" as string]: span }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, ease, delay: 0.1 + i * 0.12 }}
            >
              <span className="rf-t">
                {m.n && <i>{m.n}</i>}
                {m.t}
              </span>
              <span className="rf-line" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- MCP ---------- */
const MCP_SERVERS: [string, string, string][] = [
  ["Supabase", "/refs/logos/supabase.svg", "테이블 · RLS · 로그"],
  ["Vercel", "/refs/logos/vercel-mcp.png", "배포 · 빌드 로그 · 환경 변수"],
  ["Railway", "/refs/logos/railway-mcp.png", "서비스 · 로그 · 재배포"],
  ["Playwright", "/refs/logos/playwright-mcp.svg", "브라우저 클릭 · 스크린샷"],
  ["Context7", "/refs/logos/context7.png", "라이브러리 최신 문서"],
];
function Mcp() {
  return (
    <div className="art mx">
      <Rise className="mx-agent">
        <b>Claude Code · Codex</b>
        <span>내 계정 권한으로 대신 움직여요</span>
      </Rise>
      <div className="mx-plug" aria-hidden="true">
        <span>MCP</span>
      </div>
      <ul className="mx-list">
        {MCP_SERVERS.map(([n, logo, d], i) => (
          <motion.li
            key={n}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.07 }}
          >
            <Image src={logo} alt="" width={28} height={28} />
            <b>{n}</b>
            <span>{d}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 배포 흐름 ---------- */
function Deploy() {
  const nodes: [string, string, string?][] = [
    ["내 노트북", "git push", undefined],
    ["GitHub", "코드 보관", "/refs/logos/gh-cli.png"],
    ["Vercel", "빌드 → 서버 실행, 환경 변수", "/refs/logos/vercel-cli.png"],
    ["사용자", "https://내앱.vercel.app", undefined],
  ];
  return (
    <div className="art dp">
      <ol className="loop dp-row">
        {nodes.map(([t, d, logo], i) => (
          <motion.li
            key={t}
            data-human={i === 2 ? "1" : "0"}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.08 }}
          >
            <b>
              {logo && <Logo src={logo} />}
              {t}
            </b>
            <span>{d}</span>
          </motion.li>
        ))}
      </ol>
      <div className="dp-under">
        <div className="dp-drop">
          <span>서버가 키로 호출</span>
        </div>
        <div className="dp-ext">
          <span>
            <Logo src="/refs/logos/supabase.svg" />
            Supabase · 데이터
          </span>
          <span>OpenAI · AI</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- 자간 ---------- */
function Tracking() {
  const body: [number, string, boolean][] = [
    [0, "본문 추천", true],
    [-0.01, "줄여도 여기까지", true],
    [-0.03, "답답해요", false],
    [-0.05, "글자가 붙어요", false],
  ];
  const head: [number, string, boolean][] = [
    [0, "조금 느슨", false],
    [-0.02, "제목 추천", true],
    [-0.05, "너무 좁아요", false],
  ];
  const sample = "아이디어 한 줄로 해커톤 PRD를 뽑아요. 문서가 기준이에요.";
  const wrapText = "해커톤에서 바로 쓸 수 있는 요구사항 문서를 자동으로 만들어 드립니다";
  return (
    <div className="art tk">
      <div className="tk-group">
        <div className="tk-h">본문 16px</div>
        {body.map(([v, label, ok]) => (
          <div key={v} className="tk-row" data-ok={ok ? "1" : "0"}>
            <code>{v === 0 ? "0" : `${v}em`}</code>
            <p style={{ letterSpacing: `${v}em` }}>{sample}</p>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="tk-group">
        <div className="tk-h">제목 30px</div>
        {head.map(([v, label, ok]) => (
          <div key={v} className="tk-row tk-big" data-ok={ok ? "1" : "0"}>
            <code>{v === 0 ? "0" : `${v}em`}</code>
            <p style={{ letterSpacing: `${v}em` }}>내 버전을 정해요</p>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="tk-wrap">
        <figure>
          <p style={{ wordBreak: "normal" }}>{wrapText}</p>
          <figcaption>word-break: normal · 단어 중간에서 끊겨요</figcaption>
        </figure>
        <figure data-ok="1">
          <p style={{ wordBreak: "keep-all" }}>{wrapText}</p>
          <figcaption>word-break: keep-all · 띄어쓰기에서 끊겨요</figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ---------- 둥근 모서리 ---------- */
function Radius() {
  return (
    <div className="art rd">
      <figure data-ok="1">
        <div className="rd-out">
          <div className="rd-in" style={{ borderRadius: 16 }}>
            <i />
            <i />
          </div>
        </div>
        <figcaption>
          <b>안쪽 16px</b> = 바깥 28 − 여백 12. 두 모서리가 나란해요
        </figcaption>
      </figure>
      <figure>
        <div className="rd-out">
          <div className="rd-in" style={{ borderRadius: 28 }}>
            <i />
            <i />
          </div>
        </div>
        <figcaption>
          <b>안쪽도 28px</b>. 모서리 틈이 들쭉날쭉해 보여요
        </figcaption>
      </figure>
    </div>
  );
}

/* ---------- Apple식 연속 곡선 ---------- */
// 초타원(|x|^n + |y|^n = 1, n=5)으로 그린 모양. iOS 앱 아이콘처럼 곡률이 서서히 변한다
function superellipse(size: number, n = 5, steps = 120) {
  const a = size / 2;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = a + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = a + a * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const SQ = superellipse(120);

function Squircle() {
  return (
    <div className="art sq">
      <figure>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <rect width="120" height="120" rx="27" className="sq-fill" />
        </svg>
        <figcaption>
          <b>border-radius</b>
          원을 붙인 모양이라 직선이 끝나는 곳에서 꺾임이 보여요
        </figcaption>
      </figure>
      <figure>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <path d={SQ} className="sq-fill" />
        </svg>
        <figcaption>
          <b>연속 곡선 (squircle)</b>
          곡률이 서서히 변해서 더 매끈해요. iOS 앱 아이콘 모양
        </figcaption>
      </figure>
      <figure>
        <svg viewBox="-4 -4 128 128" aria-hidden="true">
          <path d={SQ} className="sq-soft" />
          <rect width="120" height="120" rx="27" className="sq-line" />
        </svg>
        <figcaption>
          <b>겹쳐 보면</b>
          점선이 border-radius. 모서리 근처에서 차이가 나요
        </figcaption>
      </figure>
    </div>
  );
}

/* ---------- 모션 ---------- */
const MOTIONS: [string, string, number, string][] = [
  ["linear", "linear", 500, "0.5초, 일정한 속도. 기계 같아요"],
  ["감속", "cubic-bezier(0.05, 0.7, 0.1, 1)", 500, "0.5초, 빠르게 출발해 부드럽게 멈춰요"],
  ["감속, 긴 시간", "cubic-bezier(0.05, 0.7, 0.1, 1)", 1200, "1.2초. 버튼에 쓰면 답답해요"],
];
function MotionDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [run, setRun] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!inView) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(false);
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [inView, run]);

  return (
    <div className="art mo" ref={ref}>
      {MOTIONS.map(([name, curve, ms, note]) => (
        <div key={name} className="mo-row">
          <div className="mo-label">
            <b>{name}</b>
            <span>{note}</span>
          </div>
          <div className="mo-track">
            <div className="mo-rail" style={{ transform: on ? "translateX(100%)" : "none", transition: on ? `transform ${ms}ms ${curve}` : "none" }}>
              <i />
            </div>
          </div>
        </div>
      ))}
      <div className="mo-foot">
        <button type="button" className="mo-btn" onClick={() => setRun((n) => n + 1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.75" />
            <path d="M2.6 2.4v2.9h2.9" />
          </svg>
          다시 보기
        </button>
      </div>
    </div>
  );
}

export default function DocArt({ kind, cap }: { kind: DocArtKind; cap?: string }) {
  const art = {
    harness: <Harness />,
    loop: <Loop />,
    context: <Context />,
    arch: <Arch />,
    reqflow: <ReqFlow />,
    mcp: <Mcp />,
    deploy: <Deploy />,
    tracking: <Tracking />,
    radius: <Radius />,
    squircle: <Squircle />,
    motion: <MotionDemo />,
  }[kind];
  return (
    <div className="doc-art">
      {art}
      {cap && <p className="art-cap">{cap}</p>}
    </div>
  );
}
