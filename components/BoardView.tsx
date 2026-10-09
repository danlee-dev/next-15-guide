"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PAGE_LABEL, fetchBoard, type BoardItem } from "./board";
import { Hero, Section, ease } from "./ui";
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

export default function BoardView({ s }: { s: Store; go: (id: string) => void }) {
  const [items, setItems] = useState<BoardItem[] | null>(null);
  const [err, setErr] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchBoard()
        .then((x) => {
          if (!alive) return;
          setItems(x);
          setErr("");
        })
        .catch((e: Error) => alive && setErr(e.message));
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
      setTick((n) => n + 1);
    }, 10_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // 막힌 사람이 맨 위, 그다음 많이 간 순서
  const list = (items || [])
    .slice()
    .sort((a, b) => Number(!!b.stuck) - Number(!!a.stuck) || b.done - a.done || +new Date(b.updated_at) - +new Date(a.updated_at));
  const stats: [string, number][] = [
    ["참여", list.length],
    ["레포 제출", list.filter((x) => x.repo_url).length],
    ["배포 링크", list.filter((x) => x.deploy_url).length],
    ["막힘", list.filter((x) => x.stuck).length],
  ];
  const me = s.name.trim();

  return (
    <article>
      <Hero
        chip="현황"
        meta="10초마다 새로고침"
        title="다 같이 어디까지 왔나"
        lead="이름을 적은 사람은 모두 여기에 떠요. 회고 단계에서 GitHub 레포와 배포 링크를 제출하면 바로 링크가 걸려요."
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
                    {x.cur ? PAGE_LABEL[x.cur] || x.cur : "시작 전"} · {ago(x.updated_at)}
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
                      <VercelMark />
                      배포
                    </a>
                  )}
                </div>
                {x.stuck && <p className="b-stuck">막힘 · {x.stuck}</p>}
                {x.submitted_at && <p className="b-sub">제출 {ago(x.submitted_at)}</p>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Section>
    </article>
  );
}
