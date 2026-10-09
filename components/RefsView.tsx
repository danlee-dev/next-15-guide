"use client";

import { REFS } from "@/lib/content";
import { ArrowUpRight, Command, CopyMenu, Hero, Section } from "./ui";
import type { Store } from "./store";

export default function RefsView({ s, go }: { s: Store; go: (id: string) => void }) {
  let n = 0;
  return (
    <article>
      <Hero
        chip="레퍼런스"
        meta="실습 중에도, 해커톤에서도"
        title="AI스러운 화면에서 벗어나는 법"
        lead="기준 없이 예쁘게 해 달라고 하면 다 비슷한 화면이 나와요. 디자인 규칙 파일과 레퍼런스를 먼저 주면 결과가 달라져요."
        aside={<CopyMenu page="refs" os={s.os} />}
      />

      <Section i={n++} title="이렇게 써요">
        <ol className="numlist">
          <li><span>getdesign.md나 awesome-design-md에서 마음에 드는 서비스의 DESIGN.md를 받아 docs/에 넣어요.</span></li>
          <li><span>Mobbin, Refero, Dribbble에서 만들 화면과 비슷한 화면을 찾아 스크린샷을 떠요.</span></li>
          <li><span>AI에게 이렇게 말해요. &quot;docs/DESIGN.md 규칙은 지키고, 색·타이포·간격은 docs/DESIGN-ref.md를 따라. 첨부한 스크린샷의 정보 배치를 참고해.&quot;</span></li>
          <li><span>컴포넌트가 필요하면 shadcn/ui나 21st.dev에서 가져오게 해요. 패키지를 추가하는 일이라 AGENTS.md 규칙부터 고치고 시켜요.</span></li>
        </ol>
        <div className="blk" style={{ marginTop: 32 }}>
          <div className="blk-label">DESIGN.md 받기 (실습 프로젝트 폴더에서)</div>
          <Command k="getdesign" os={s.os} />
        </div>
      </Section>

      {REFS.map((g) => (
        <Section key={g.title} i={n++} title={g.title} note={g.note}>
          <ul className="links">
            {g.items.map((it) => (
              <li key={it.url}>
                <a href={it.url} target="_blank" rel="noopener noreferrer">
                  <span className="ln">
                    {it.name}
                    <ArrowUpRight />
                  </span>
                  <span className="ld">{it.desc}</span>
                  <span className="lu">{new URL(it.url).hostname.replace(/^www\./, "")}</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go("guide")}>
          ← 바이브 코딩 가이드
        </button>
        <button type="button" className="btn btn-ink" onClick={() => go(s.last || "setup")}>
          실습으로 돌아가기
        </button>
      </nav>
    </article>
  );
}
