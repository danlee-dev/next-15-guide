import { STEPS } from "@/lib/content";
import { SESSIONS, type Session } from "@/lib/sessions";

// 모든 세션의 단계 (단계 id 는 세션끼리 안 겹친다)
const ALL_STEPS = SESSIONS.flatMap((x) => x.steps);
import { VERDICT_LABEL, type Store } from "./store";

export function stepState(s: Store, id: string): "todo" | "part" | "done" | "stuck" {
  const st = ALL_STEPS.find((x) => x.id === id);
  if (!st) return "todo";
  if (s.stuck[id]) return "stuck";
  const c = s.checks[id] || {};
  const a = s.ans[id] || {};
  const total = st.checks.length + st.questions.length;
  const done = st.checks.filter((_, i) => c[i]).length + st.questions.filter((q) => (a[q.id] || "").trim()).length;
  return done === 0 ? "todo" : done >= total ? "done" : "part";
}

// 사이드바 링이 얼마나 찼는지 (체크 + 내 말로 답하기). 0~1
export function stepProgress(s: Store, id: string) {
  const st = ALL_STEPS.find((x) => x.id === id);
  if (!st) return 0;
  const c = s.checks[id] || {};
  const a = s.ans[id] || {};
  const total = st.checks.length + st.questions.length;
  const done = st.checks.filter((_, i) => c[i]).length + st.questions.filter((q) => (a[q.id] || "").trim()).length;
  return total ? done / total : 0;
}

// 세션 하나에서 끝낸 단계 수
export const sessionDone = (s: Store, ses: Session) => ses.steps.filter((x) => stepState(s, x.id) === "done").length;

export function summaryText(s: Store) {
  const L = [`[Session 8 실습 노트] ${s.name || "(이름 없음)"}`];
  const label = { done: "완료", part: "진행 중", stuck: "막힘", todo: "안 함" } as const;
  for (const st of STEPS) {
    L.push(`\n■ ${st.label} · ${label[stepState(s, st.id)]}`);
    const a = s.ans[st.id] || {};
    for (const q of st.questions) if ((a[q.id] || "").trim()) L.push(`- ${q.label}\n  ${a[q.id].trim().replace(/\n/g, "\n  ")}`);
    if ((a.log || "").trim()) L.push(`- commit: ${a.log.trim()}`);
    if (s.fb[st.id]) L.push(`- 튜터: ${VERDICT_LABEL[s.fb[st.id].verdict]}`);
    if (s.stuck[st.id]) L.push(`- 막힘: ${s.stuck[st.id]}`);
  }
  return L.join("\n");
}
