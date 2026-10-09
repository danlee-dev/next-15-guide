"use client";

import { motion } from "motion/react";
import { GUIDE_SECTIONS as RAW_SECTIONS, HACKATHON as RAW_HACKATHON, INTERVENE, PROMPT_PAIRS, ROLES, tailor } from "@/lib/content";
import { CopyMenu, Hero, Section, ease } from "./ui";
import { TutorChat } from "./Tutor";
import GuideArt from "./GuideArt";
import type { Patch, Store } from "./store";

export default function GuideView({ s, patch, go }: { s: Store; patch: Patch; go: (id: string) => void }) {
  const GUIDE_SECTIONS = tailor(RAW_SECTIONS, s.tool);
  const HACKATHON = tailor(RAW_HACKATHON, s.tool);
  let n = 0;
  return (
    <article>
      <Hero
        chip="가이드"
        meta="해커톤 전에 한 번 읽어 두기"
        title="해 줘, 해 줘 말고. AI와 일을 나눠요"
        lead="바이브 코딩은 AI에게 다 맡기는 게 아니에요. 무엇을 만들지, 어디까지 만들지, 잘 됐는지는 사람이 정하고, 그 사이를 AI가 빠르게 채워요."
        aside={<CopyMenu page="guide" os={s.os} tool={s.tool} />}
      />

      <Section i={n++} title="누가 무엇을 하나">
        <div className="roles">
          <div className="role dark">
            <h3>사람이 하는 일</h3>
            <ul>
              {ROLES.human.map((r) => (
                <li key={r.t}>
                  <b>{r.t}</b>
                  <span>{r.d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="role">
            <h3>AI에게 맡기는 일</h3>
            <ul>
              {ROLES.ai.map((r) => (
                <li key={r.t}>
                  <b>{r.t}</b>
                  <span>{r.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section i={n++} title="언제 개입해야 하나" note="이 신호가 보이면 멈추기">
        <ol className="timeline">
          {INTERVENE.map((t, i) => (
            <motion.li
              key={t.when}
              className="tl"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease, delay: i * 0.04 }}
            >
              <h3>{t.when}</h3>
              <ul>
                {t.signs.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="act" style={{ margin: 0 }}>{t.act}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section i={n++} title="프롬프트, 이렇게 바꿔요">
        <div className="pairs">
          {PROMPT_PAIRS.map((p, i) => (
            <motion.div
              key={i}
              className="pair"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease }}
            >
              <div className="bad">
                <span className="tag">이렇게 말고</span>
                {p.bad}
              </div>
              <div className="good">
                <span className="tag">이렇게</span>
                {p.good}
              </div>
              <p className="pair-why">{p.why}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {GUIDE_SECTIONS.map((g) => (
        <Section key={g.title} i={n++} title={g.title}>
          <p className="sec-lead">{g.lead}</p>
          {g.art && <GuideArt kind={g.art} />}
          <div className="points">
            {g.points.map((p) => (
              <div key={p.t}>
                <b>{p.t}</b>
                <span>{p.d}</span>
              </div>
            ))}
          </div>
          {g.title.startsWith("디자인") && (
            <p className="sec-lead" style={{ marginTop: 28 }}>
              링크는{" "}
              <button type="button" className="textlink" onClick={() => go("refs")}>
                디자인 레퍼런스
              </button>
              에 모아 뒀어요.
            </p>
          )}
        </Section>
      ))}

      <Section i={n++} title="10/31 해커톤 체크리스트">
        <ol className="numlist">
          {HACKATHON.map((h) => (
            <li key={h}>
              <span>{h}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section i={n++} title="튜터에게 묻기">
        <TutorChat
          stepId="guide"
          stepTitle="바이브 코딩 가이드"
          chips={["계획 리뷰 때 뭘 봐야 해요?", "AI가 짠 코드를 어떻게 검토해요?", "새 세션은 언제 열어요?"]}
          thread={s.chat.guide || []}
          patch={patch}
          tool={s.tool}
        />
      </Section>

      <nav className="pager">
        <button type="button" className="btn btn-soft" onClick={() => go("library")}>
          ← 자료실
        </button>
        <button type="button" className="btn btn-ink" onClick={() => go("refs")}>
          디자인 레퍼런스 →
        </button>
      </nav>
    </article>
  );
}
