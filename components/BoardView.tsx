"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TOOL_LABEL } from "@/lib/content";
import { PAGE_LABEL, useBoard, type BoardItem } from "./board";
import { Hero, Section, ease } from "./ui";
import type { Session } from "@/lib/sessions";
import type { Store } from "./store";

function ago(iso: string | null) {
  if (!iso) return "";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "방금";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return `${Math.floor(sec / 86400)}일 전`;
}

const GitHubMark = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
    <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3" />
  </svg>
);

const VercelMark = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="currentColor">
    <path d="M24 22.53H0L12 1.47z" />
  </svg>
);

const DocMark = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M4 1.75h5.5L12.5 4.75v9.5h-8.5z" />
    <path d="M9.25 1.75v3.25h3.25M6.5 8.5h3.5M6.5 11h3.5" strokeLinecap="round" />
  </svg>
);

export default function BoardView({ s, ses, go }: { s: Store; ses: Session; go: (id: string) => void }) {
  const { items, err } = useBoard(ses.id);
  // "3분 전" 같은 글자만 다시 그린다. 데이터는 실시간으로 들어온다
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  // 같은 사람이 노트북과 폰처럼 브라우저 두 개로 열면 줄이 둘 생긴다. 이름이 같으면 한 줄로 합친다
  const merged = new Map<string, BoardItem>();
  for (const x of items || []) {
    const prev = merged.get(x.name);
    if (!prev) {
      merged.set(x.name, x);
      continue;
    }
    const [lead, other] = x.done > prev.done || (x.done === prev.done && x.updated_at > prev.updated_at) ? [x, prev] : [prev, x];
    merged.set(x.name, {
      ...lead,
      stuck: lead.stuck || other.stuck,
      feature: lead.feature || other.feature,
      repo_url: lead.repo_url || other.repo_url,
      deploy_url: lead.deploy_url || other.deploy_url,
      submitted_at: lead.submitted_at || other.submitted_at,
    });
  }

  // 막힌 사람이 맨 위, 그다음 많이 간 순서
  const list = [...merged.values()]
    .sort((a, b) => Number(!!b.stuck) - Number(!!a.stuck) || b.done - a.done || +new Date(b.updated_at) - +new Date(a.updated_at));
  const stats: [string, number][] = [
    ["참여", list.length],
    [ses.submit.stats[0], list.filter((x) => x.repo_url).length],
    [ses.submit.stats[1], list.filter((x) => x.deploy_url).length],
    ["막힘", list.filter((x) => x.stuck).length],
  ];
  const me = s.name.trim();

  return (
    <article>
      <Hero
        chip={ses.label}
        meta={ses.kind === "club" ? "현황 · 실시간으로 바뀌어요" : "제출 현황 · 실시간으로 바뀌어요"}
        title={ses.kind === "club" ? "팀마다 무엇을 고른나" : "다 같이 어디까지 왔나"}
        lead={ses.submit.boardLead}
      />

      <Section i={0} title="한눈에">
        <div className="stats">
          {stats.map(([label, n]) => (
            <div key={label} className="stat" data-warn={label === "막힘" && n > 0 ? "1" : "0"}>
              <b>{n}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section i={1} title="사람별" note="막힌 사람이 맨 위에 떠요. 옆에 있으면 같이 봐 주세요">
        {err && <p className="board-msg">{err}</p>}
        {!err && items === null && <p className="board-msg">불러오는 중...</p>}
        {!err && items && list.length === 0 && <p className="board-msg">아직 아무도 없어요</p>}
        <ul className="board">
          <AnimatePresence initial={false}>
            {list.map((x) => (
              <motion.li
                key={x.id}
                layout
                className="brow"
                data-stuck={x.stuck ? "1" : "0"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                <div className="b-who">
                  <b>
                    {x.name}
                    {x.name === me && <span className="b-me">나</span>}
                  </b>
                  <span>
                    {x.cur ? PAGE_LABEL[x.cur] || x.cur : "시작 전"}
                    {x.tool ? ` · ${TOOL_LABEL[x.tool]}` : ""} · {ago(x.updated_at)}
                  </span>
                </div>
                <div className="b-prog" aria-label={`${x.done} / ${x.total} 단계`}>
                  <div className="b-bar">
                    <i style={{ transform: `scaleX(${Math.min(1, x.done / (x.total || 1))})` }} />
                  </div>
                  <span>
                    {x.done}/{x.total}
                  </span>
                </div>
                <div className="b-links">
                  {x.repo_url ? (
                    <a href={x.repo_url} target="_blank" rel="noopener noreferrer" title={x.repo_url}>
                      <GitHubMark />
                      레포
                    </a>
                  ) : (
                    <span className="b-none">레포 전</span>
                  )}
                  {x.deploy_url && (
                    <a href={x.deploy_url} target="_blank" rel="noopener noreferrer" title={x.deploy_url}>
                      {ses.kind === "club" ? <DocMark /> : <VercelMark />}
                      {ses.submit.link.board}
                    </a>
                  )}
                </div>
                {x.feature && <p className="b-feat">{x.feature}</p>}
                {x.stuck && <p className="b-stuck">막힘 · {x.stuck}</p>}
                {x.submitted_at && <p className="b-sub">제출 {ago(x.submitted_at)}</p>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Section>

      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go(ses.page)}>
          ← {ses.label} 개요
        </button>
        <span />
      </nav>
    </article>
  );
}
