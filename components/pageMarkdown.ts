import { ASSIGNMENT, COMMANDS, ERRORS, GUIDE_SECTIONS, HACKATHON, INTERVENE, PROMPT_PAIRS, REFS, ROLES, STEPS, TOOL_LABEL, tailor, tl, type AgentTool, type CommandKey, type OS, type Step } from "@/lib/content";
import { DOCS, DOC_MAP, LIBRARY, type Block, type Doc } from "@/lib/docs";
import { CLUB } from "@/lib/club";
import { CLUB_SESSIONS, SESSIONS, sessionOf } from "@/lib/sessions";

// "페이지 복사": 학회원이 Claude Code / ChatGPT 등에 붙여넣고 질문할 수 있게 화면 내용을 마크다운으로 만든다.
// 내 OS에 맞는 명령어만 넣는다. 학회원이 쓴 답은 넣지 않는다 (AI가 대신 답하게 만들지 않으려고).

const SITE = "https://nextku-dev.vercel.app";

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

// 단계 시간 표시: "13:20" 은 시작 시각, "20분" 은 걸리는 시간 (소모임), 그 외는 남는 시간용 단계
export const startLabel = (start: string) => (start.includes(":") ? `${start} 시작` : /분$/.test(start) ? `${start} 동안` : "시간 남으면, 아니면 과제로");

const fence = (text: string, lang = "") => "```" + lang + "\n" + text.trim() + "\n```";

export function stepMarkdown(step: Step, os: OS) {
  const L: string[] = [`## ${step.label}. ${step.title} (${startLabel(step.start)})`, "", step.lead];
  const todo = (step.todo || []).filter((t) => !t.os || t.os === os);
  if (todo.length) {
    L.push("", "### 먼저 할 일");
    for (const t of todo) {
      L.push("", `- ${t.label}${t.note ? ` (${t.note})` : ""}`);
      if (t.download) L.push("", `받기: ${SITE}${t.download.href}`);
      if (t.cmd) {
        const c = COMMANDS[t.cmd] as { where?: string; plain?: boolean };
        if (c.where) L.push("", `${c.where}:`);
        L.push("", fence(cmd(t.cmd, os), c.plain ? "markdown" : "bash"));
      }
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

export function guideMarkdown(tool: AgentTool | "") {
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
  return tl(L.join("\n"), tool);
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

// 자료실 페이지 한 장. 화면에서 고른 OS·도구에 맞는 블록만 넣는다
const shown = (b: Block, os: OS, tool: AgentTool | "") => !(("os" in b && b.os && b.os !== os) || ("tool" in b && b.tool && tool && b.tool !== tool));

export function docMarkdown(doc: Doc, os: OS, tool: AgentTool | "") {
  const L: string[] = [`## ${doc.title}`, "", doc.lead];
  for (const sec of doc.sections) {
    L.push("", `### ${sec.title}`);
    for (const b of sec.blocks) {
      if (!shown(b, os, tool)) continue;
      switch (b.k) {
        case "p":
          L.push("", b.t);
          break;
        case "points":
          L.push("", ...b.items.map((x) => `- ${x.t}: ${x.d}`));
          break;
        case "steps":
          L.push("", ...b.items.map((x, i) => `${i + 1}. ${x}`));
          break;
        case "list":
          L.push("", ...b.items.map((x) => `- ${x}`));
          break;
        case "code": {
          const text = b.both ?? b[os];
          if (text) L.push("", `${b.label}${b.where ? ` (${b.where})` : ""}:`, "", fence(text, b.plain ? "markdown" : "bash"));
          if (text && b.tip) L.push("", b.tip);
          break;
        }
        case "prompt":
          L.push("", "AI에게 보낼 말:", "", fence(b.t));
          break;
        case "table":
          L.push("", `| ${b.cols.join(" | ")} |`, `| ${b.cols.map(() => "---").join(" | ")} |`, ...b.rows.map((r) => `| ${r.join(" | ")} |`));
          break;
        case "tools":
          L.push("", ...b.items.map((x, i) => `${b.ordered ? `${i + 1}.` : "-"} [${x.name}](${x.url}): ${x.d}`));
          break;
        case "warn":
          L.push("", `${b.title || "조심할 것"}:`, ...b.items.map((x) => `- ${x}`));
          break;
        case "shot":
          L.push("", `(화면: ${b.cap} ${b.href})`);
          break;
        case "shots":
          for (const x of b.items) L.push("", `(화면: ${x.cap})`);
          break;
        case "go":
          L.push("", `→ ${b.t}: ${SITE}/#${b.to}`);
          break;
        case "art":
          if (b.cap) L.push("", `(그림 설명: ${b.cap})`);
          break;
      }
    }
  }
  return tl(L.join("\n"), tool);
}

export function libraryMarkdown() {
  const L: string[] = ["## 자료실"];
  for (const g of LIBRARY) {
    L.push("", `### ${g.title}`);
    for (const it of g.items) L.push(`- [${it.label}](${SITE}/#${it.id}): ${it.desc}`);
  }
  return L.join("\n");
}

// 세션 개요: 순서와 과제
function sessionsMarkdown(only?: string, kind: "session" | "club" = "session") {
  const L: string[] = [];
  for (const x of SESSIONS.filter((v) => (only ? v.id === only : v.kind === kind))) {
    L.push(`## ${x.label}. ${x.title} (${[x.dateLabel, x.length].filter(Boolean).join(", ")})`, "", x.lead, "", "### 순서");
    for (const st of x.steps) L.push(`- ${st.start} ${st.label}: ${st.title} (${SITE}/#${st.id})`);
    if (x.assignment) {
      L.push("", `### ${x.kind === "club" ? "다음 모임까지" : "과제"} (${x.assignment.due})`);
      for (const a of x.assignment.items) L.push(`- ${a.t}: ${a.d}`);
      L.push(`- 제출: ${x.assignment.submit}`);
    }
  }
  return L.join("\n");
}

function header(what: string, tool: AgentTool | "", club = false) {
  const who = tool ? TOOL_LABEL[tool] : "Claude Code / Codex";
  if (club)
    return `# ${CLUB.name} (${CLUB.tagline}): ${what}\n\n출처: ${SITE}\n우리 팀 목표: 만든 걸로 실제 수익을 내 보는 것. 근거(고객이 말했거나 행동했거나 돈을 낸 것) 없는 기능은 넣지 않는다. 아래 내용을 기준으로 내 질문에 답해 줘. 새 기능이나 확장 아이디어를 먼저 제안하지 말고, 기능 이야기가 나오면 근거부터 물어봐 줘. 도구는 ${who}.`;
  return `# NEXT 15기 개발 세션: ${what}\n\n출처: ${SITE}\n오늘 실습: 빈 폴더에서 ${who}로 "PRD 메이커"(Next.js + OpenAI + Supabase)를 만든다. 아래 내용을 기준으로 내 질문에 답해 줘. 코드를 대신 다 써 주기보다, 내가 이해하고 직접 확인할 수 있게 설명해 줘.`;
}

const CLUB_DOC_IDS = ["money-prd", "first-steps"];

// 소모임 홈: 원칙, 회차, 자료
function clubMarkdown() {
  const L: string[] = [`## ${CLUB.name}`, "", CLUB.lead, "", "### 원칙"];
  CLUB.principles.forEach((p, i) => L.push(`${i + 1}. ${p.t}: ${p.d}`));
  L.push("", sessionsMarkdown(undefined, "club"), "", "### 좋은 자료");
  for (const r of CLUB.refs) L.push(`- [${r.name}](${r.url}): ${r.d}`);
  return L.join("\n");
}

export function pageMarkdown(page: string, os: OS, tool: AgentTool | "" = "") {
  const ses = sessionOf(page);
  const club = ses?.kind === "club" || page === "club" || CLUB_DOC_IDS.includes(page);
  const step = ses?.steps.find((x) => x.id === page);
  if (step) return `${header(`${ses!.label} ${step.label}`, tool, club)}\n\n${stepMarkdown(tailor(step, tool), os)}\n`;
  if (page === "club") return `${header("홈", tool, true)}\n\n${clubMarkdown()}\n`;
  if (page === "guide") return `${header("바이브 코딩 가이드", tool)}\n\n${guideMarkdown(tool)}\n`;
  if (page === "refs") return `${header("디자인 레퍼런스", tool)}\n\n${refsMarkdown(os)}\n`;
  if (page === "library") return `${header("자료실", tool)}\n\n${libraryMarkdown()}\n`;
  if (page === "home") return `${header("홈", tool)}\n\n${sessionsMarkdown()}\n\n${libraryMarkdown()}\n`;
  if (ses && ses.page === page) return `${header(`${ses.label} 개요`, tool, club)}\n\n${sessionsMarkdown(ses.id)}\n`;
  const doc = DOC_MAP[page];
  if (doc) return `${header(doc.label, tool, club)}\n\n${docMarkdown(doc, os, tool)}\n`;
  return allMarkdown(os, tool, page);
}

// 자료실 전체: 목록 + 바이브 코딩 가이드 + 디자인 레퍼런스 + 자료 6개. 고른 OS·도구에 맞는 명령어만 넣는다
export function libraryAllMarkdown(os: OS, tool: AgentTool | "" = "") {
  return [header("자료 전체", tool), libraryMarkdown(), guideMarkdown(tool), refsMarkdown(os), ...DOCS.map((d) => docMarkdown(d, os, tool))].join("\n\n") + "\n";
}

// 노트 전체. 소모임 화면에서 누르면 소모임 회차 단계와 소모임 자료만 묶는다
export function allMarkdown(os: OS, tool: AgentTool | "" = "", page = "") {
  if (page === "club" || CLUB_DOC_IDS.includes(page) || sessionOf(page)?.kind === "club") {
    const steps = CLUB_SESSIONS.flatMap((x) => x.steps);
    const docs = CLUB_DOC_IDS.map((id) => DOC_MAP[id]);
    return [header("전체", tool, true), clubMarkdown(), ...steps.map((x) => stepMarkdown(tailor(x, tool), os)), ...docs.map((d) => docMarkdown(d, os, tool))].join("\n\n") + "\n";
  }
  return (
    [header("전체", tool), ...STEPS.map((x) => stepMarkdown(tailor(x, tool), os)), guideMarkdown(tool), refsMarkdown(os), ...DOCS.filter((d) => !CLUB_DOC_IDS.includes(d.id)).map((d) => docMarkdown(d, os, tool))].join("\n\n") + "\n"
  );
}
