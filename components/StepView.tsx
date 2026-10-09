"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ASSIGNMENT, ERRORS, STEPS, type Step } from "@/lib/content";
import { CheckPath, CodeBlock, Command, CopyMenu, Hero, Prompt, Section, ease, useCopy } from "./ui";
import { FeedbackPanel, TutorChat } from "./Tutor";
import type { Patch, Store } from "./store";
import { summaryText } from "./summary";
import SubmitBox from "./SubmitBox";
import { commitPrompt } from "./pageMarkdown";

function AutoText({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
  }, [value]);
  return <textarea ref={ref} id={id} className="field" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />;
}

export default function StepView({ step, s, patch, go }: { step: Step; s: Store; patch: Patch; go: (id: string) => void }) {
  const idx = STEPS.indexOf(step);
  const prev = STEPS[idx - 1];
  const next = STEPS[idx + 1];
  const ans = s.ans[step.id] || {};
  const checks = s.checks[step.id] || {};
  const { copy, Fallback } = useCopy();
  let n = 0;

  const setAns = (k: string, v: string) => patch((st) => ({ ...st, ans: { ...st.ans, [step.id]: { ...(st.ans[step.id] || {}), [k]: v } } }));
  const toggle = (i: number) =>
    patch((st) => ({ ...st, checks: { ...st.checks, [step.id]: { ...(st.checks[step.id] || {}), [i]: !(st.checks[step.id] || {})[i] } } }));

  const visibleTodo = (step.todo || []).filter((t) => !t.os || t.os === s.os);
  const stuck = s.stuck[step.id];
  const errs = ERRORS.filter((e) => e.steps.includes(step.id) && (!e.os || e.os === s.os));

  return (
    <article>
      <Hero chip={step.label} meta={step.start.includes(":") ? `${step.start} 시작` : "시간 남으면, 아니면 과제로"} title={step.title} lead={step.lead} aside={<CopyMenu page={step.id} os={s.os} />} />

      {visibleTodo.length > 0 && (
        <Section i={n++} title="먼저 할 일">
          {visibleTodo.map((t, i) => (
            <div className="blk" key={i}>
              <div className="blk-label">{t.label}</div>
              {t.note && <div className="blk-note">{t.note}</div>}
              {t.download && (
                <a className="btn btn-ink dl" href={t.download.href} download>
                  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" />
                  </svg>
                  {t.download.label}
                </a>
              )}
              {t.cmd && <Command k={t.cmd} os={s.os} />}
              {t.tip && <p className="blk-tip">{t.tip}</p>}
            </div>
          ))}
        </Section>
      )}

      {step.prompt && (
        <Section i={n++} title="AI에게 보낼 말" note="짧게 시키고, 계획부터 받기">
          <Prompt text={step.prompt} own={step.ownPrompt} />
        </Section>
      )}

      {step.more && (
        <Section i={n++} title={step.more.title}>
          <ul className="more-list">
            {step.more.items.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          {step.more.note && <p className="blk-tip">{step.more.note}</p>}
        </Section>
      )}

      {step.design && (
        <Section i={n++} title="디자인을 내 취향으로" note="선택">
          <p className="sec-lead">
            프리셋 대신 실제 서비스의 DESIGN.md를 참고 파일로 받아서 AI에게 같이 읽혀요. 다른 사이트는{" "}
            <button type="button" className="textlink" onClick={() => go("refs")}>
              디자인 레퍼런스
            </button>
            에 모아 뒀어요.
          </p>
          <Command k="getdesign" os={s.os} />
        </Section>
      )}

      {step.checks.length > 0 && (
        <Section i={n++} title="체크리스트" note={`${step.checks.filter((_, i) => checks[i]).length} / ${step.checks.length}`}>
          <ul className="checks">
            {step.checks.map((c, i) => {
              const on = !!checks[i];
              const id = `ck-${step.id}-${i}`;
              return (
                <li key={i}>
                  <label className="check" htmlFor={id} data-on={on ? "1" : "0"}>
                    <input id={id} type="checkbox" checked={on} onChange={() => toggle(i)} />
                    <motion.span
                      className="cbox"
                      initial={false}
                      animate={{ backgroundColor: on ? "#1d1d1f" : "rgba(0,0,0,0)", scale: on ? [1, 1.12, 1] : 1 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <CheckPath on={on} color="#ffffff" />
                    </motion.span>
                    <span className="ctext">
                      {c.text}
                      {c.sub && <small>{c.sub}</small>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {step.checks.every((_, i) => checks[i]) && step.questions.some((q) => !(ans[q.id] || "").trim()) && (
            <p className="checks-left">
              체크 완료. 아래 &quot;내 말로 답하기&quot; {step.questions.filter((q) => !(ans[q.id] || "").trim()).length}개까지 쓰면 이 단계가 끝나요.
            </p>
          )}
          {step.commit && (
            <div className="blk" style={{ marginTop: 28 }}>
              <div className="blk-label">끝나면 커밋: AI에게 시켜도 돼요</div>
              <Prompt text={commitPrompt(step.commit)} />
              <p className="blk-tip">AI가 커밋했다고 해도 터미널에 git log --oneline -1 을 쳐서 내 눈으로 확인해요. 직접 하고 싶으면 아래 명령어나 VS Code 왼쪽 소스 제어 탭을 써도 같아요.</p>
              <CodeBlock text={step.commit} where="직접 할 때 · macOS · Windows 동일" />
            </div>
          )}
        </Section>
      )}

      {errs.length > 0 && (
        <Section i={n++} title="자주 만나는 에러" note="에러 문구는 요약하지 말고 그대로 AI에게">
          <ul className="errs">
            {errs.map((e) => (
              <li key={e.sym}>
                <b>{e.sym}</b>
                <span>
                  <em>원인</em>
                  {e.cause}
                </span>
                <span>
                  <em>해결</em>
                  {e.fix}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section i={n++} title="내 말로 답하기" note="AI 답을 붙여넣지 말고, 내 코드를 보면서">
        {step.questions.map((q) => {
          const id = `q-${step.id}-${q.id}`;
          return (
            <div className="q" key={q.id}>
              <label htmlFor={id}>{q.label}</label>
              {q.hint && <div className="hint">{q.hint}</div>}
              {q.input ? (
                <input id={id} className="field mono" value={ans[q.id] || ""} placeholder={q.placeholder} onChange={(e) => setAns(q.id, e.target.value)} autoComplete="off" />
              ) : (
                <AutoText id={id} value={ans[q.id] || ""} onChange={(v) => setAns(q.id, v)} />
              )}
            </div>
          );
        })}
        {step.commit && (
          <div className="q">
            <label htmlFor={`q-${step.id}-log`}>git log --oneline -1 결과</label>
            <div className="hint">커밋했다는 표시예요. 터미널에 나온 한 줄을 그대로 붙여 주세요</div>
            <input
              id={`q-${step.id}-log`}
              className="field mono"
              value={ans.log || ""}
              placeholder="a1b2c3d step1: UI with mock data"
              onChange={(e) => setAns("log", e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        <FeedbackPanel
          stepId={step.id}
          stepTitle={`${step.label}: ${step.title}`}
          qa={step.questions.map((q) => ({ q: q.label, a: ans[q.id] || "" }))}
          log={ans.log}
          fb={s.fb[step.id]}
          patch={patch}
        />
      </Section>

      <Section i={n++} title="튜터에게 묻기" note="코드는 안 줘요. 어디를 보면 되는지 알려 줘요">
        <TutorChat stepId={step.id} stepTitle={`${step.label}: ${step.title}`} chips={step.chips} thread={s.chat[step.id] || []} patch={patch} />
      </Section>

      <Section i={n++} title="막혔나요?">
        <div className="stuck" data-on={stuck ? "1" : "0"}>
          <div className="askbar">
            <input
              id={`stuck-${step.id}`}
              placeholder="어디서 막혔는지 한 줄, 에러 첫 줄도 좋아요"
              defaultValue={stuck || ""}
              autoComplete="off"
              aria-label="막힌 내용"
            />
          </div>
          {stuck ? (
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => patch((st) => { const c = { ...st.stuck }; delete c[step.id]; return { ...st, stuck: c }; })}
            >
              해결됐어요
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ink"
              onClick={() => {
                const el = document.getElementById(`stuck-${step.id}`) as HTMLInputElement | null;
                const v = el?.value.trim() || "(내용 없음)";
                patch((st) => ({ ...st, stuck: { ...st.stuck, [step.id]: v } }));
                copy(`[막힘] ${s.name || "(이름)"} · ${step.label} · ${v}`, "잡담방에 붙여넣어 주세요");
              }}
            >
              막혔어요
            </button>
          )}
          {stuck && <p className="stuck-msg">손을 들어 주세요. 개발팀이 갈게요. 잡담방에 올릴 메시지도 복사해 뒀어요.</p>}
        </div>
        {Fallback}
      </Section>

      {step.summary && (
        <Section i={n++} title="과제" note={ASSIGNMENT.due}>
          <ol className="numlist">
            {ASSIGNMENT.items.map((a) => (
              <li key={a.t}>
                <span>
                  <b>{a.t}</b> {a.d}
                </span>
              </li>
            ))}
          </ol>
          <p className="blk-tip">제출: {ASSIGNMENT.submit}</p>
        </Section>
      )}

      {step.summary && (
        <Section i={n++} title="링크 제출" note="제출 현황판에 바로 떠요">
          <SubmitBox s={s} patch={patch} go={go} />
        </Section>
      )}

      {step.summary && (
        <Section i={n++} title="내 답 모아서 복사" note="선택">
          <p className="sec-lead">진행 상황은 현황판에 자동으로 올라가요. 노션 과제에 내 답까지 붙이고 싶을 때만 쓰면 돼요.</p>
          <button type="button" className="btn btn-ink" onClick={() => copy(summaryText(s), "내 답을 복사했어요")}>
            내 답 모아서 복사
          </button>
        </Section>
      )}

      <motion.nav className="pager" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
        {prev ? (
          <button type="button" className="btn btn-soft" onClick={() => go(prev.id)}>
            ← {prev.label}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button type="button" className="btn btn-ink" onClick={() => go(next.id)}>
            {next.label} →
          </button>
        ) : (
          <button type="button" className="btn btn-soft" onClick={() => go("guide")}>
            바이브 코딩 가이드 →
          </button>
        )}
      </motion.nav>
    </article>
  );
}
