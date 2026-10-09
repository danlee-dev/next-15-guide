import { ASSIGNMENT, COMMANDS, ERRORS, GUIDE_SECTIONS, HACKATHON, INTERVENE, PROMPT_PAIRS, REFS, ROLES, STEPS, type CommandKey, type OS, type Step } from "@/lib/content";

// "페이지 복사": 학회원이 Claude Code / ChatGPT 등에 붙여넣고 질문할 수 있게 화면 내용을 마크다운으로 만든다.
// 내 OS에 맞는 명령어만 넣는다. 학회원이 쓴 답은 넣지 않는다 (AI가 대신 답하게 만들지 않으려고).

const SITE = "https://next-guide-15.vercel.app";

function cmd(k: CommandKey, os: OS) {
  const c = COMMANDS[k] as { both?: string; mac?: string; win?: string };
  return c.both ?? c[os] ?? "";
}

// 단계의 커밋 명령에서 메시지를 꺼내 "AI에게 커밋 시키는 말"로 바꾼다
export function commitPrompt(commit: string) {
  const msg = commit.match(/-m "([^"]+)"/)?.[1] || "작업 내용";
  const push = /git push/.test(commit) ? " 그다음 git push까지 해 줘." : "";
  return `바뀐 파일 목록을 먼저 보여 주고, 문제 없으면 "${msg}" 메시지로 커밋해 줘.${push}`;
}

const fence = (text: string, lang = "") => "```" + lang + "\n" + text.trim() + "\n```";

export function stepMarkdown(step: Step, os: OS) {
  const L: string[] = [`## ${step.label}. ${step.title} (${step.start} 시작)`, "", step.lead];
  const todo = (step.todo || []).filter((t) => !t.os || t.os === os);
  if (todo.length) {
    L.push("", "### 먼저 할 일");
    for (const t of todo) {
      L.push("", `- ${t.label}${t.note ? ` (${t.note})` : ""}`);
      if (t.download) L.push("", `받기: ${SITE}${t.download.href}`);
      if (t.cmd) L.push("", fence(cmd(t.cmd, os), "bash"));
      if (t.tip) L.push("", t.tip);
    }
  }
  if (step.prompt) L.push("", step.ownPrompt ? "### AI에게 보낼 말 (예시, 직접 써 보기)" : "### AI에게 보낼 말", "", fence(step.prompt));
  if (step.more) {
    L.push("", `### ${step.more.title}`);
    for (const m of step.more.items) L.push(`- ${m}`);
    if (step.more.note) L.push("", step.more.note);
  }
  if (step.checks.length) {
    L.push("", "### 체크리스트");
    for (const c of step.checks) L.push(`- [ ] ${c.text}${c.sub ? ` (${c.sub})` : ""}`);
  }
  if (step.commit) L.push("", "### 끝나면 커밋 (AI에게 시켜도 된다)", "", fence(commitPrompt(step.commit)), "", "직접 할 때:", "", fence(step.commit, "bash"));
  const errs = ERRORS.filter((e) => e.steps.includes(step.id) && (!e.os || e.os === os));
  if (errs.length) {
    L.push("", "### 자주 만나는 에러");
    for (const e of errs) L.push(`- ${e.sym}: 원인 ${e.cause} / 해결 ${e.fix}`);
  }
  if (step.summary) {
    L.push("", `### 과제 (${ASSIGNMENT.due})`);
    for (const a of ASSIGNMENT.items) L.push(`- [ ] ${a.t}: ${a.d}`);
    L.push(`- 제출: ${ASSIGNMENT.submit}`);
  }
  if (step.questions.length) {
    L.push("", "### 내 말로 답할 질문");
    for (const q of step.questions) L.push(`- ${q.label}${q.hint ? ` (힌트: ${q.hint})` : ""}`);
  }
  return L.join("\n");
}

export function guideMarkdown() {
  const L: string[] = ["## 바이브 코딩 가이드", "", "### 사람이 하는 일"];
  for (const r of ROLES.human) L.push(`- ${r.t}: ${r.d}`);
  L.push("", "### AI에게 맡길 일");
  for (const r of ROLES.ai) L.push(`- ${r.t}: ${r.d}`);
  L.push("", "### 언제 개입하나");
  for (const x of INTERVENE) L.push(`- ${x.when}: 신호(${x.signs.join(" / ")}) → ${x.act}`);
  L.push("", "### 프롬프트 나쁜 예 / 좋은 예");
  for (const p of PROMPT_PAIRS) L.push(`- 나쁜 예: ${p.bad}`, `  좋은 예: ${p.good.replace(/\n/g, " ")}`, `  이유: ${p.why}`);
  for (const sec of GUIDE_SECTIONS) {
    L.push("", `### ${sec.title}`, sec.lead);
    for (const p of sec.points) L.push(`- ${p.t}: ${p.d}`);
  }
  L.push("", "### 해커톤 체크리스트");
  for (const h of HACKATHON) L.push(`- [ ] ${h}`);
  return L.join("\n");
}

export function refsMarkdown(os: OS) {
  const L: string[] = [
    "## 디자인 레퍼런스",
    "",
    "1. getdesign.md나 awesome-design-md에서 마음에 드는 서비스의 DESIGN.md를 받아 docs/에 넣는다.",
    "2. Mobbin, Refero, Dribbble에서 만들 화면과 비슷한 화면을 찾아 스크린샷을 뜬다.",
    '3. AI에게 "docs/DESIGN.md 규칙은 지키고, 색·타이포·간격은 docs/DESIGN-ref.md를 따라. 첨부한 스크린샷의 정보 배치를 참고해." 라고 말한다.',
    "",
    fence(cmd("getdesign", os), "bash"),
  ];
  for (const g of REFS) {
    L.push("", `### ${g.title} (${g.note})`);
    for (const it of g.items) L.push(`- [${it.name}](${it.url}): ${it.desc}`);
  }
  return L.join("\n");
}

function header(what: string) {
  return `# NEXT Session 8 실습 노트: ${what}\n\n출처: ${SITE}\n오늘 실습: 빈 폴더에서 Claude Code / Codex로 "PRD 메이커"(Next.js + OpenAI + Supabase)를 만든다. 아래 내용을 기준으로 내 질문에 답해 줘. 코드를 대신 다 써 주기보다, 내가 이해하고 직접 확인할 수 있게 설명해 줘.`;
}

export function pageMarkdown(page: string, os: OS) {
  const step = STEPS.find((x) => x.id === page);
  if (step) return `${header(step.label)}\n\n${stepMarkdown(step, os)}\n`;
  if (page === "guide") return `${header("바이브 코딩 가이드")}\n\n${guideMarkdown()}\n`;
  if (page === "refs") return `${header("디자인 레퍼런스")}\n\n${refsMarkdown(os)}\n`;
  return allMarkdown(os);
}

export function allMarkdown(os: OS) {
  return [header("전체"), ...STEPS.map((x) => stepMarkdown(x, os)), guideMarkdown(), refsMarkdown(os)].join("\n\n") + "\n";
}
