import { STEPS } from "@/lib/content";
import { VERDICT_LABEL, type Store } from "./store";

export function stepState(s: Store, id: string): "todo" | "part" | "done" | "stuck" {
  const st = STEPS.find((x) => x.id === id);
  if (!st) return "todo";
  if (s.stuck[id]) return "stuck";
  const c = s.checks[id] || {};
  const a = s.ans[id] || {};
  const total = st.checks.length + st.questions.length;
  const done = st.checks.filter((_, i) => c[i]).length + st.questions.filter((q) => (a[q.id] || "").trim()).length;
  return done === 0 ? "todo" : done >= total ? "done" : "part";
}

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
