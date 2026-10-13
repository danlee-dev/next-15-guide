"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { tailor, type AgentTool, type OS } from "@/lib/content";
import { LIBRARY, type Block, type Doc } from "@/lib/docs";
import DocArt from "./DocArt";
import { Lightbox, ZoomHint } from "./Lightbox";
import { EXTRA_PAGES } from "./TopExtras";
import { ArrowUpRight, CodeBlock, CopyIcon, CopyMenu, Hero, Prompt, Section, ease, useCopy } from "./ui";
import { libraryAllMarkdown } from "./pageMarkdown";
import type { Store } from "./store";

// 자료실 페이지 한 장. lib/docs.ts 의 블록을 순서대로 그린다.

// 문장 안의 `...` 를 코드 글씨로
export function Rich({ t }: { t: string }) {
  return (
    <>
      {t.split(/(`[^`]+`)/).map((p, i) =>
        p.length > 2 && p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="ic">
            {p.slice(1, -1)}
          </code>
        ) : (
          p
        ),
      )}
    </>
  );
}

const visible = (b: Block, os: OS, tool: AgentTool | "") =>
  !(("os" in b && b.os && b.os !== os) || ("tool" in b && b.tool && tool && b.tool !== tool));

function BlockView({ b, s, go }: { b: Block; s: Store; go: (id: string) => void }) {
  switch (b.k) {
    case "p":
      return (
        <p className="doc-p">
          <Rich t={b.t} />
        </p>
      );
    case "points":
      return (
        <div className="points">
          {b.items.map((x) => (
            <div key={x.t}>
              <b>
                <Rich t={x.t} />
              </b>
              <span>
                <Rich t={x.d} />
              </span>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="numlist">
          {b.items.map((x) => (
            <li key={x}>
              <span>
                <Rich t={x} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "list":
      return (
        <ul className="dlist">
          {b.items.map((x) => (
            <li key={x}>
              <Rich t={x} />
            </li>
          ))}
        </ul>
      );
    case "code": {
      const text = b.both ?? b[s.os];
      if (!text) return null;
      const where = b.where || (b.both ? "macOS · Windows 동일" : s.os === "win" ? "Windows PowerShell" : "macOS 터미널");
      return (
        <div>
          <div className="blk-label">{b.label}</div>
          <CodeBlock text={text} where={where} plain={b.plain} />
          {b.tip && (
            <p className="blk-tip">
              <Rich t={b.tip} />
            </p>
          )}
        </div>
      );
    }
    case "prompt":
      return <Prompt text={b.t} />;
    case "table":
      return (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                {b.cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.join("|")}>
                  {r.map((c, i) => (
                    <td key={i} data-label={b.cols[i]}>
                      <Rich t={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "art":
      return <DocArt kind={b.name} cap={b.cap} />;
    case "shot":
      return (
        <Lightbox items={[{ src: b.src, alt: b.alt, cap: b.cap, w: 1280, h: 800 }]}>
          {(open) => (
            <figure className="shot">
              <button type="button" className="shot-btn" onClick={() => open(0)} aria-label={`${b.alt} 크게 보기`}>
                <Image src={b.src} alt={b.alt} width={1280} height={800} sizes="(max-width: 760px) 100vw, 780px" />
                <ZoomHint />
              </button>
              <figcaption>
                {b.cap}
                <a href={b.href} target="_blank" rel="noopener noreferrer">
                  {new URL(b.href).hostname.replace(/^www\./, "")}
                  <ArrowUpRight />
                </a>
              </figcaption>
            </figure>
          )}
        </Lightbox>
      );
    case "shots":
      return (
        <Lightbox items={b.items}>
          {(open) => (
            <div className="shots">
              {b.items.map((x, i) => (
                <figure key={x.src}>
                  <button type="button" className="shot-btn" onClick={() => open(i)} aria-label={`${x.alt} 크게 보기`}>
                    <Image src={x.src} alt={x.alt} width={x.w} height={x.h} sizes="(max-width: 760px) 100vw, 380px" />
                    <ZoomHint />
                  </button>
                  <figcaption>{x.cap}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </Lightbox>
      );
    case "tools":
      return (
        <ul className="tools" data-ordered={b.ordered ? "1" : "0"}>
          {b.items.map((x, i) => (
            <li key={x.name}>
              <a href={x.url} target="_blank" rel="noopener noreferrer">
                {b.ordered && <em>{i + 1}</em>}
                {x.logo ? <Image className="tlogo" src={x.logo} alt="" width={32} height={32} /> : b.items.some((y) => y.logo) && <span className="tlogo" aria-hidden="true" />}
                <span className="tname">
                  <b>{x.name}</b>
                  <span>{x.d}</span>
                </span>
                <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
      );
    case "warn":
      return (
        <div className="warn">
          <div className="warn-h">{b.title || "조심할 것"}</div>
          <ul>
            {b.items.map((x) => (
              <li key={x}>
                <Rich t={x} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "go":
      return (
        <p className="go">
          <button type="button" className="textlink" onClick={() => go(b.to)}>
            {b.t}
          </button>
          <span aria-hidden="true"> →</span>
        </p>
      );
  }
}

function Pager({ id, go }: { id: string; go: (id: string) => void }) {
  const i = EXTRA_PAGES.findIndex(([x]) => x === id);
  const prev = EXTRA_PAGES[i - 1];
  const next = EXTRA_PAGES[i + 1];
  return (
    <nav className="pager">
      {prev ? (
        <button type="button" className="btn btn-soft" onClick={() => go(prev[0])}>
          ← {prev[1]}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button type="button" className="btn btn-ink" onClick={() => go(next[0])}>
          {next[1]} →
        </button>
      ) : (
        <button type="button" className="btn btn-soft" onClick={() => go("library")}>
          자료실로
        </button>
      )}
    </nav>
  );
}

export default function DocView({ doc: raw, s, go }: { doc: Doc; s: Store; go: (id: string) => void }) {
  // {{Claude Code|Codex}} 표시를 고른 도구에 맞춘다
  const doc = tailor(raw, s.tool);
  return (
    <article>
      <Hero chip={doc.chip} meta={doc.meta} title={doc.title} lead={doc.lead} aside={<CopyMenu page={doc.id} os={s.os} tool={s.tool} />} />
      {doc.sections.map((sec, i) => (
        <Section key={sec.title} i={i} title={sec.title} note={sec.note}>
          <div className="doc-blocks">
            {sec.blocks
              .filter((b) => visible(b, s.os, s.tool))
              .map((b, j) => (
                <BlockView key={j} b={b} s={s} go={go} />
              ))}
          </div>
        </Section>
      ))}
      <Pager id={doc.id} go={go} />
    </article>
  );
}

export function LibraryView({ s, go }: { s: Store; go: (id: string) => void }) {
  let n = 0;
  const { copy, Fallback } = useCopy();
  const count = LIBRARY.reduce((a, g) => a + g.items.length, 0);
  return (
    <article>
      <Hero
        chip="자료실"
        meta="실습 끝나고, 해커톤 전에"
        title="필요할 때 꺼내 보는 자료"
        lead="실습 노트가 오늘 1시간용이라면, 여기는 해커톤과 그다음 프로젝트까지 쓰는 자료예요. 한 페이지에 한 주제씩 짧게 나눴어요."
        aside={
          // 자료 전체를 한 번에 AI 에게 붙여넣을 수 있게. 고른 OS·도구에 맞는 명령어만 들어간다
          <button type="button" className="copy-trigger" onClick={() => copy(libraryAllMarkdown(s.os, s.tool), `자료 ${count}개를 한 번에 복사했어요`)}>
            <CopyIcon />
            자료 전체 복사
          </button>
        }
      />
      {Fallback && <div className="lib-fallback">{Fallback}</div>}
      {LIBRARY.map((g) => (
        <Section key={g.title} i={n++} title={g.title}>
          <ul className="lib">
            {g.items.map((it, i) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + n * 0.05 + i * 0.05 }}
              >
                <button type="button" onClick={() => go(it.id)}>
                  <span className="lib-t">{it.label}</span>
                  <span className="lib-d">{it.desc}</span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </motion.li>
            ))}
          </ul>
        </Section>
      ))}
      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go(s.last || "setup")}>
          ← 실습으로
        </button>
        <button type="button" className="btn btn-ink" onClick={() => go("ai")}>
          AI 이해하기 →
        </button>
      </nav>
    </article>
  );
}
