export type OS = "mac" | "win";

export type Command = { both?: string; mac?: string; win?: string };

export type Question = { id: string; label: string; hint?: string; input?: boolean; placeholder?: string };

export type Step = {
  id: string;
  label: string;
  start: string;
  title: string;
  lead: string;
  todo?: { label: string; cmd?: keyof typeof COMMANDS; os?: OS; note?: string; tip?: string }[];
  prompt?: string;
  ownPrompt?: boolean;
  design?: boolean;
  checks: { text: string; sub?: string }[];
  commit?: string;
  questions: Question[];
  chips: string[];
  summary?: boolean;
  more?: { title: string; items: string[]; note?: string };
};

export const COMMANDS = {
  create: {
    both: `npx create-next-app@latest prd-maker --yes
cd prd-maker
npm install openai @supabase/supabase-js
npm run dev`,
  },
  winPolicy: {
    win: `# npx에서 "running scripts is disabled" 에러가 날 때만
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`,
  },
  pack: {
    mac: `# 압축 푼 위치가 다르면 첫 줄 경로만 바꾸기
P=~/Downloads/prd-maker-pack
cp -R $P/docs $P/supabase .
cp $P/CLAUDE.md $P/env.example .
cat $P/AGENTS.append.md >> AGENTS.md
cp env.example .env.local`,
    win: `# 압축 푼 위치가 다르면 첫 줄 경로만 바꾸기
$P = "$HOME\\Downloads\\prd-maker-pack"
Copy-Item -Recurse "$P\\docs", "$P\\supabase" .
Copy-Item "$P\\CLAUDE.md", "$P\\env.example" .
Get-Content "$P\\AGENTS.append.md" -Encoding utf8 |
  Add-Content AGENTS.md -Encoding utf8
Copy-Item env.example .env.local`,
  },
  push: {
    both: `# GitHub에서 New repository로 prd-maker를 먼저 만들기 (README 체크 해제)
git add .
git commit -m "docs: add session pack"
git remote add origin https://github.com/<내 아이디>/prd-maker.git
git push -u origin main`,
  },
  envAi: {
    both: `# .env.local
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-6-luna`,
  },
  envDb: {
    both: `# .env.local 에 두 줄 추가 (Supabase > Settings > API Keys)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...`,
  },
  restart: {
    both: `# 터미널에서 Ctrl+C 로 끄고 다시 켜기
npm run dev`,
  },
  getdesign: {
    both: `# 브랜드 스타일 목록 보기
npx getdesign list
# 고른 걸 참고 파일로 받기 (예: elevenlabs, linear.app, notion, vercel)
npx getdesign add elevenlabs --out docs/DESIGN-ref.md`,
  },
} satisfies Record<string, Command>;

export type CommandKey = keyof typeof COMMANDS;

export const STEPS: Step[] = [
  {
    id: "setup",
    label: "준비",
    start: "0:10",
    title: "레포를 만들고, 문서부터 깔아요",
    lead: "빈 폴더에서 시작해요. AI가 코드를 쓰기 전에 읽을 문서를 레포에 먼저 넣어 두는 게 이번 단계의 전부예요.",
    todo: [
      { label: "프로젝트 만들기", cmd: "create", tip: "cd prd-maker는 방금 만든 prd-maker 폴더로 들어가는 명령이에요. VS Code에서 파일 > 폴더 열기로 prd-maker를 열고 그 안의 터미널(보기 > 터미널)을 쓰면 이미 그 폴더라서, cd 없이 npm install부터 치면 돼요." },
      { label: "Windows에서 에러가 나면", cmd: "winPolicy", os: "win", tip: "PowerShell 창에 그대로 붙여넣고 Enter. 바꿀지 물어보면 Y를 누르면 돼요. 한 번만 하면 다음부터는 안 나와요." },
      { label: "문서팩 넣기", cmd: "pack", tip: "명령어가 낯설면 손으로 해도 결과는 같아요. 압축 푼 prd-maker-pack에서 docs, supabase 폴더와 CLAUDE.md, env.example을 prd-maker 폴더로 끌어다 놓고, AGENTS.append.md 내용을 복사해 prd-maker의 AGENTS.md 맨 아래에 붙여넣은 다음, env.example을 복사해 이름을 .env.local로 바꾸면 끝이에요. Mac Finder에서는 점(.)으로 시작하는 파일이 숨겨져 있어서 Cmd+Shift+. 을 눌러야 보여요." },
      { label: "GitHub에 올리기", cmd: "push", tip: "New repository는 GitHub 웹사이트 오른쪽 위 + 버튼에서 만들어요. 이름만 prd-maker로 적고 나머지는 그대로 두면 돼요. push할 때 아이디와 비밀번호를 물어보면 손 들어 주세요. GitHub는 비밀번호 대신 브라우저 로그인이나 토큰을 써서, 처음엔 다들 여기서 한 번 막혀요." },
    ],
    checks: [
      { text: "localhost:3000에 Next 기본 화면이 떴다", sub: "확인했으면 Ctrl+C로 꺼 두기. Mac도 Cmd가 아니라 Ctrl이에요" },
      { text: "docs/와 supabase/schema.sql이 프로젝트 안에 있다" },
      { text: "AGENTS.md 맨 아래에 PRD 메이커 규칙이 붙었다", sub: "위쪽 Next.js 블록은 그대로 두기" },
      { text: "GitHub 레포 페이지에서 docs/가 보인다" },
    ],
    questions: [
      { id: "repo", label: "내 GitHub 레포 주소", input: true, placeholder: "https://github.com/아이디/prd-maker" },
      { id: "why", label: "문서를 코드보다 먼저 넣는 이유를 내 말로 한 줄", hint: "연사 세션에서 들은 얘기를 떠올려 봐요" },
    ],
    chips: ["AGENTS.md랑 CLAUDE.md는 뭐가 달라요?", "--yes 옵션은 정확히 뭘 해요?"],
  },
  {
    id: "plan",
    label: "기획",
    start: "0:17",
    title: "AI와 같이 내 버전을 정해요",
    lead: "PRD는 혼자 쓰지 않아요. AI에게 질문을 먼저 받고, 후보를 받고, 결정은 내가 해요.",
    prompt: `docs/PRD.md를 읽어. 나는 이 PRD 메이커를 [___]용으로 바꾸고 싶어.
아직 아무것도 고치지 말고, 먼저 나한테 질문 3개만 해.
내 답을 들으면 PRD.md 8번 "내 버전" 4칸의 후보를 칸마다 2개씩, 장단점과 같이 제안해.
내가 고르면 그때 PRD.md 8번에 써 줘. DESIGN.md 8번 프리셋도 하나 추천해 줘.`,
    design: true,
    checks: [
      { text: "AI 질문 3개에 답했다" },
      { text: "후보 중에서 내가 골랐다", sub: "고르기 어려우면 개발팀을 불러 같이 보기" },
      { text: "PRD.md 8번, DESIGN.md 8번을 직접 열어 읽었다" },
    ],
    commit: `git add . && git commit -m "docs: my version"`,
    questions: [
      { id: "mine", label: "내 버전 한 줄 요약", hint: "예: 동아리 행사 기획안을 뽑아 주는 PRD 메이커, 성격은 깐깐한 CTO" },
      { id: "drop", label: "AI가 제안했지만 내가 버린 것 하나와 그 이유", hint: "오늘 내가 PM으로 한 첫 결정이에요" },
    ],
    chips: ["P0랑 P1은 어떻게 나눠요?", "타깃을 좁히면 뭐가 좋아요?"],
  },
  {
    id: "s0",
    label: "Step 0",
    start: "0:23",
    title: "계획만 세워요, 코드 0줄",
    lead: "코드를 쓰기 전에 AI가 문서를 제대로 읽었는지부터 확인해요. 계획부터 세우면 AI가 혼자 판단해서 산으로 가는 걸 시작 전에 막을 수 있어요.",
    prompt: `docs/PRD.md, docs/DESIGN.md, docs/API.md, AGENTS.md를 읽어.
1) 이 프로젝트가 뭘 만드는지 5줄로 요약해.
2) Step 1~4 구현 계획을 단계별로 짧게 세워. 각 단계에서 만들거나 고칠 파일 이름을 적어.
아직 코드는 쓰지 마.`,
    checks: [
      { text: "AI의 5줄 요약을 PRD와 비교했다", sub: "다르면 여기서 바로 잡기. 나중에 잡으면 비싸요" },
      { text: "계획에 문서에 없는 패키지가 있으면 빼 달라고 했다", sub: "zod, shadcn, axios 같은 것" },
      { text: "Claude Code라면 Shift+Tab으로 plan 모드를 켜고 보냈다", sub: "Codex는 \"계획부터 보여 줘\"로 충분해요" },
    ],
    questions: [
      { id: "diff", label: "AI 요약에서 PRD와 다르거나 빠진 게 있었나요? 어떻게 바로잡았나요?", hint: "없었다면 요약에서 제일 중요한 한 줄을 골라 적기" },
      { id: "file", label: "계획에 나온 파일 중 이름만 보고는 역할을 몰랐던 파일 하나와, 물어봐서 알게 된 역할", hint: "예: lib/spec-schema.ts" },
    ],
    chips: ["plan 모드는 뭐가 달라요?", "계획에서 뭘 보고 빼 달라고 해요?"],
  },
  {
    id: "s1",
    label: "Step 1",
    start: "0:25",
    title: "화면부터, 가짜 데이터로",
    lead: "짧게 시키고 계획부터 받아요. 계획에 질문 하나, 또는 수정 하나를 하는 게 이번 단계의 핵심이에요.",
    prompt: `Step 1. docs/PRD.md, docs/DESIGN.md대로 화면만 만들어 줘. 아직 API는 없으니 가짜 데이터로.
코드 쓰기 전에 계획(만들 파일, 각 파일이 하는 일)부터 보여 줘.`,
    checks: [
      { text: "AI 계획을 받았다", sub: "Claude Code는 Shift+Tab으로 plan 모드" },
      { text: "계획에 질문하거나 하나 고쳤다", sub: "예: 이 파일은 왜 필요해? / 이건 이번 단계에서 빼 줘" },
      { text: "버튼을 누르면 1초 뒤 가짜 결과 카드가 뜬다" },
      { text: "커밋했다" },
    ],
    commit: `git add . && git commit -m "step1: UI with mock data"`,
    questions: [
      { id: "review", label: "계획 리뷰 때 AI에게 뭘 묻거나 고쳤나요?", hint: "물은 말 그대로, 그리고 AI 답을 한 줄로" },
      { id: "concept", label: "page.tsx 맨 위 \"use client\"는 왜 있나요? 지우면 어떻게 될까요?", hint: "내 page.tsx에서 useState나 onClick이 쓰인 줄을 찾아 같이 적어 보기" },
    ],
    chips: ["Server Component랑 Client Component 차이가 뭐예요?", "계획에서 뭘 보고 질문해야 해요?"],
  },
  {
    id: "s2",
    label: "Step 2",
    start: "0:31",
    title: "OpenAI를 연결해요",
    lead: "진짜 PRD가 나와요. 키가 서버 밖으로 나가지 않는지 내 눈으로 확인하는 게 이번 단계의 핵심이에요.",
    todo: [
      { label: "내 OpenAI 키 넣기", cmd: "envAi", tip: ".env.local은 VS Code 같은 편집기에서 열어 = 뒤에 키를 붙여넣고 저장하면 돼요. 키 앞뒤에 따옴표나 공백은 넣지 않아요." },
      { label: "dev 서버 다시 켜기", cmd: "restart", tip: "Ctrl+C는 Mac에서도 Cmd가 아니라 Ctrl이에요. 꺼진 뒤 키보드 위 화살표를 누르면 방금 친 npm run dev가 다시 나와요." },
    ],
    prompt: `Step 2. docs/API.md 4번, 6번대로 OpenAI를 연결해 줘. 이번엔 Supabase 저장 없이 결과만 화면에.
코드 쓰기 전에 계획부터. 특히 키를 어느 파일에서 읽는지 알려 줘.`,
    checks: [
      { text: "계획을 받고 질문하거나 하나 고쳤다" },
      { text: "진짜 PRD가 화면에 뜬다", sub: "10~30초 걸려요" },
      { text: "개발자도구 Network 탭의 specs 요청 어디에도 sk- 키가 없다", sub: "Mac Cmd+Option+I · Windows F12" },
      { text: "npm run dev 터미널에 POST /api/specs 로그가 찍혔다", sub: "이게 서버에서 돈 코드예요" },
      { text: "커밋했다" },
    ],
    commit: `git add . && git commit -m "step2: generate PRD with OpenAI"`,
    questions: [
      { id: "review", label: "계획 리뷰 때 AI에게 뭘 묻거나 고쳤나요?" },
      { id: "concept", label: "버튼을 누른 순간부터 카드가 뜰 때까지, 어떤 파일이 어떤 순서로 실행되나요? 브라우저와 서버를 나눠서", hint: "내 프로젝트의 파일 이름으로. OPENAI_API_KEY를 읽는 파일도 꼭 넣기" },
    ],
    chips: ["JSON Schema strict는 왜 써요?", "server-only는 뭘 막아 줘요?"],
  },
  {
    id: "s3",
    label: "Step 3",
    start: "0:39",
    title: "Supabase에 저장하고 목록을 만들어요",
    lead: "새로고침해도 남아 있는 게 목표예요. RLS 정책이 0개인데 왜 저장되는지 설명할 수 있으면 통과예요.",
    todo: [
      { label: "Supabase SQL Editor에서 supabase/schema.sql 전체를 붙여넣고 Run", note: "Success. No rows returned 가 나오면 성공", tip: "터미널이 아니라 Supabase 웹 화면에서 하는 일이에요. 내 프로젝트의 supabase/schema.sql을 편집기로 열어 전체 선택해서 복사한 뒤 SQL Editor에 붙여넣으면 돼요." },
      { label: "Supabase 키 넣기", cmd: "envDb", tip: "Step 2에서 연 .env.local 맨 아래에 두 줄을 이어 붙이면 돼요. 새 파일을 만들 필요는 없어요." },
      { label: "dev 서버 다시 켜기", cmd: "restart", tip: "Ctrl+C는 Mac에서도 Cmd가 아니라 Ctrl이에요. 꺼진 뒤 키보드 위 화살표를 누르면 방금 친 npm run dev가 다시 나와요." },
    ],
    prompt: `Step 3. docs/API.md 4번, 5번대로 생성 결과를 Supabase specs 테이블에 저장하고, /specs 목록 페이지를 만들어 줘.
코드 쓰기 전에 계획부터. 어떤 키로 Supabase에 붙는지도 알려 줘.`,
    checks: [
      { text: "계획을 받고 질문하거나 하나 고쳤다" },
      { text: "PRD를 하나 만들고 Table Editor를 새로고침하면 row가 보인다" },
      { text: "/specs 목록이 뜨고 새로고침해도 남아 있다" },
      { text: "커밋했다" },
    ],
    commit: `git add . && git commit -m "step3: save to Supabase and list"`,
    questions: [
      { id: "review", label: "계획 리뷰 때 AI에게 뭘 묻거나 고쳤나요?" },
      { id: "concept", label: "specs 테이블은 RLS가 켜져 있고 정책이 0개예요. 그런데 왜 저장이 되나요? publishable 키로 바꾸면요?", hint: "schema.sql 끝부분과 lib/supabase.ts를 열어 보기" },
    ],
    chips: ["grant랑 RLS는 뭐가 달라요?", "jsonb 한 칸에 통째로 넣는 이유가 뭐예요?"],
  },
  {
    id: "s4",
    label: "Step 4",
    start: "0:47",
    title: "내 버전을 만들고 push해요",
    lead: "정해진 프롬프트가 없어요. PRD.md 8번에 내가 정한 걸 내 말로 시켜 보세요. 못 끝내면 과제로 이어서 해도 돼요.",
    prompt: `docs/PRD.md 8번 "내 버전"에 적은 것만 구현해 줘. 계획부터 보여 줘.`,
    ownPrompt: true,
    more: {
      title: "시간 남으면 (PRD 4번 P1)",
      items: ["마크다운 복사 버튼", "/specs/[id] 상세 보기와 삭제"],
      note: "상세 페이지는 Suspense로 감싸야 npm run build가 통과해요. AGENTS.md에도 적혀 있어요.",
    },
    checks: [
      { text: "내가 쓴 프롬프트로 계획을 받고 리뷰했다" },
      { text: "PRD.md 8번에 적은 완료 기준을 확인했다", sub: "출력 섹션을 늘렸으면 schema의 required에도 들어갔는지" },
      { text: "커밋하고 push 했다" },
    ],
    commit: `git add . && git commit -m "step4: my version"
git push`,
    questions: [
      { id: "prompt", label: "내가 직접 쓴 프롬프트" },
      { id: "concept", label: "AI가 이번에 바꾼 파일과, 그 파일을 바꾼 이유", hint: "git diff --stat 으로 바뀐 파일 목록을 볼 수 있어요" },
    ],
    chips: ["프롬프트를 어떻게 써야 AI가 덜 헤매요?", "git diff는 어떻게 읽어요?"],
  },
  {
    id: "wrap",
    label: "회고",
    start: "0:52",
    title: "오늘 남은 것",
    lead: "딸깍으로 끝난 시간인지, 뭔가 남은 시간인지는 여기서 갈려요. 두 줄만 쓰고 제출 요약을 복사해 잡담방에 올려 주세요.",
    checks: [],
    questions: [
      { id: "fix", label: "오늘 AI가 틀렸거나, 내가 방향을 바꾼 순간 하나", hint: "없었다면 AI 말을 그대로 믿고 넘어간 순간 하나" },
      { id: "hack", label: "10/31 해커톤에서 그대로 써먹을 것 하나" },
    ],
    chips: [],
    summary: true,
  },
];

export const REFS: { title: string; note: string; items: { name: string; desc: string; url: string; logo?: string; shot?: string }[] }[] = [
  {
    title: "DESIGN.md",
    note: "AI가 읽는 디자인 규칙 파일",
    items: [
      { name: "getdesign.md", desc: "브랜드별 DESIGN.md를 npx 한 줄로 받는 곳. 색, 타이포, 간격, 컴포넌트, 모션까지 들어 있어요", url: "https://getdesign.md", logo: "/refs/logos/getdesign.png", shot: "/refs/getdesign.webp" },
      { name: "awesome-design-md", desc: "Stripe, Linear, ElevenLabs 같은 실제 서비스를 분석한 DESIGN.md 모음", url: "https://github.com/VoltAgent/awesome-design-md", logo: "/refs/logos/github-mcp.png" },
    ],
  },
  {
    title: "컴포넌트",
    note: "가져다 쓰는 UI 부품",
    items: [
      { name: "shadcn/ui", desc: "코드가 내 프로젝트로 복사되는 UI 라이브러리. 고치기 쉬워서 AI와 궁합이 좋아요", url: "https://ui.shadcn.com", logo: "/refs/logos/shadcn-ui.png", shot: "/refs/shadcn-ui.webp" },
      { name: "21st.dev", desc: "shadcn 기반 React 컴포넌트와 템플릿. AI에게 줄 프롬프트로도 복사돼요", url: "https://21st.dev", logo: "/refs/logos/21st-dev.png", shot: "/refs/21st-dev.webp" },
      { name: "Magic UI", desc: "움직임이 들어간 랜딩용 컴포넌트", url: "https://magicui.design", logo: "/refs/logos/magic-ui.png", shot: "/refs/magic-ui.webp" },
      { name: "Lucide", desc: "shadcn이 기본으로 쓰는 아이콘", url: "https://lucide.dev", logo: "/refs/logos/lucide.png", shot: "/refs/lucide.webp" },
    ],
  },
  {
    title: "화면 레퍼런스",
    note: "잘 만든 서비스 화면 보기",
    items: [
      { name: "Mobbin", desc: "실제 앱과 웹의 화면과 플로우를 단계별로 모아 둔 라이브러리", url: "https://mobbin.com", logo: "/refs/logos/mobbin.png", shot: "/refs/mobbin.webp" },
      { name: "Refero", desc: "실서비스 UI를 기능별로 검색. 온보딩, 결제, 빈 상태 같은 것", url: "https://refero.design", logo: "/refs/logos/refero.png", shot: "/refs/refero.webp" },
      { name: "Dribbble", desc: "디자이너 시안 모음. 분위기와 색 조합을 잡을 때", url: "https://dribbble.com", logo: "/refs/logos/dribbble.png", shot: "/refs/dribbble.webp" },
      { name: "Recent (구 Godly)", desc: "움직임이 좋은 웹사이트 모음. Godly가 이름을 바꿔 여기로 옮겼어요", url: "https://recent.design", logo: "/refs/logos/godly.svg", shot: "/refs/godly.webp" },
      { name: "Awwwards", desc: "웹 디자인 어워드 수상작", url: "https://www.awwwards.com", logo: "/refs/logos/awwwards.png" },
      { name: "UI Bowl", desc: "국내 UI/UX 레퍼런스 큐레이션", url: "https://uibowl.io", logo: "/refs/logos/ui-bowl.png", shot: "/refs/ui-bowl.webp" },
    ],
  },
  {
    title: "폰트",
    note: "한글",
    items: [
      { name: "Pretendard", desc: "요즘 한국 서비스에서 가장 많이 쓰는 본문 폰트. 이 페이지도 이걸 써요", url: "https://github.com/orioncactus/pretendard" },
      { name: "Google Fonts", desc: "Noto Sans KR, IBM Plex Sans KR 같은 무료 한글 폰트", url: "https://fonts.google.com/?subset=korean" },
    ],
  },
];

/* ---------------- 바이브 코딩 가이드 ---------------- */

export const ROLES = {
  human: [
    { t: "무엇을, 누구를 위해", d: "문제와 타깃, 이번에 안 만들 것을 정해요. AI는 후보를 낼 뿐이에요." },
    { t: "범위 자르기", d: "P0를 3개 이하로. 시간 안에 끝낼 수 있는지는 사람이 판단해요." },
    { t: "핵심 구조", d: "데이터 모델, API 경계, 키가 어디에 있는지. 여기가 틀리면 나중에 다 갈아엎어요." },
    { t: "계획 리뷰", d: "AI가 낸 계획에서 파일, 패키지, 범위를 보고 질문하거나 고쳐요." },
    { t: "직접 확인", d: "브라우저, 터미널, DB를 내 눈으로. \"다 됐습니다\"는 확인이 아니에요." },
    { t: "돈, 권한, 개인정보", d: "결제, 로그인, 키, 사용자 데이터는 AI가 짠 코드라도 내가 한 줄씩 읽어요." },
    { t: "취향", d: "디자인이 좋은지, 문구가 어색한지는 결국 사람이 결정해요." },
  ],
  ai: [
    { t: "문서 초안", d: "PRD, API 설계, README 초안. 단, 나한테 질문부터 하게 시키기." },
    { t: "선택지 제안", d: "구조나 기능 후보를 장단점과 같이 2~3개." },
    { t: "정해진 구조 안의 구현", d: "화면, API, 연결 코드. 문서가 있으면 훨씬 정확해요." },
    { t: "반복 작업", d: "비슷한 화면 여러 개, 타입 정리, 문구 일괄 수정, 커밋. 대신 결과는 git log로 내가 확인해요." },
    { t: "원인 추적", d: "에러 로그를 주면 원인부터 설명하게 하고 최소 수정." },
    { t: "점검", d: "보안 기본 조치, 리팩터링 후보, 테스트 케이스 뽑기." },
  ],
};

export const INTERVENE: { when: string; signs: string[]; act: string }[] = [
  { when: "시작하기 전", signs: ["PRD, DESIGN, API 문서가 없다", "\"앱 만들어 줘\" 한 줄로 시작하려고 한다"], act: "코드 말고 문서부터. AI에게 질문을 받으면서 docs/를 먼저 채워요." },
  { when: "계획을 받았을 때", signs: ["문서에 없는 파일이나 패키지가 있다", "이번 단계보다 범위가 크다", "왜 필요한지 모르는 파일이 있다"], act: "실행 전에 묻거나 빼요. 계획 단계에서 고치는 게 제일 싸요." },
  { when: "실행하는 중", signs: ["같은 에러가 두 번 반복된다", "갑자기 파일이 많이 바뀐다", "any, 하드코딩, 빈 catch 같은 \"일단\" 코드가 보인다"], act: "멈추고 git diff로 확인. 이상하면 git restore 하고 더 작게 다시 시켜요." },
  { when: "결과를 볼 때", signs: ["화면은 되는데 새로고침하면 사라진다", "에러는 없는데 값이 이상하다", "개발자도구에 키가 보인다"], act: "사일런트 페일이에요. 데이터가 어디에 저장되는지, 키가 어디서 읽히는지 직접 따라가요." },
  { when: "대화가 길어졌을 때", signs: ["AI가 앞에서 정한 걸 잊는다", "같은 설명을 반복하게 된다"], act: "결정을 docs/에 적고 새 세션에서 문서부터 읽게 해요." },
];

export const PROMPT_PAIRS: { bad: string; good: string; why: string }[] = [
  {
    bad: "PRD 메이커 앱 만들어 줘. 예쁘게.",
    good: "docs/PRD.md의 P0 첫 번째 기능만 만들어 줘. 화면은 docs/DESIGN.md 규칙대로, 데이터는 가짜로. 코드 쓰기 전에 만들 파일과 이유부터 보여 줘.",
    why: "범위, 기준 문서, 완료 상태, 계획 먼저. 네 가지가 들어가면 AI가 덜 헤매요.",
  },
  {
    bad: "에러 나. 고쳐 줘.",
    good: "아래 에러가 났어. 고치기 전에 원인부터 설명해. 어느 파일 몇 번째 줄인지. 그다음 관련 없는 파일은 건드리지 말고 최소로만 고쳐.\n[브라우저 에러] [터미널 로그]",
    why: "원인을 먼저 듣고 나면 다음에 같은 에러를 혼자 잡을 수 있어요.",
  },
  {
    bad: "디자인 좀 더 세련되게.",
    good: "docs/DESIGN-ref.md의 색, 타이포, 간격을 따라 결과 카드만 다시 잡아 줘. 첨부한 스크린샷의 정보 배치를 참고하고, 이모지 아이콘과 그라데이션 배경은 쓰지 마.",
    why: "\"세련되게\"는 AI마다 같은 답이 나와요. 기준 파일, 레퍼런스, 금지 목록을 주면 달라져요.",
  },
];

export const GUIDE_SECTIONS: { title: string; lead: string; art?: "prd" | "design" | "loop" | "stuck" | "safe"; points: { t: string; d: string }[] }[] = [
  {
    title: "PRD를 잘 쓰는 법",
    art: "prd",
    lead: "AI에게 PRD를 \"써 달라\"고 하지 말고, AI가 나에게 질문하게 만들어요.",
    points: [
      { t: "문제부터 한 줄", d: "누가, 언제, 무엇 때문에 불편한지. 기능 목록은 그다음이에요." },
      { t: "P0는 3개 이하", d: "없으면 데모가 안 되는 것만. 나머지는 P1로 미뤄요." },
      { t: "안 만드는 것", d: "로그인, 결제, 관리자 화면처럼 이번에 일부러 빼는 걸 적어요. 범위가 지켜져요." },
      { t: "완료 기준", d: "\"버튼을 누르면 30초 안에 카드가 뜬다\"처럼 눈으로 확인할 수 있게 적어요." },
      { t: "질문 먼저 받기", d: "\"PRD 쓰기 전에 나한테 질문 3개 해\"로 시작하면 내 머릿속이 먼저 정리돼요." },
    ],
  },
  {
    title: "디자인이 AI스럽지 않게",
    art: "design",
    lead: "아무 기준 없이 \"예쁘게\"라고 하면 다 비슷한 화면이 나와요. 기준을 먼저 줘요.",
    points: [
      { t: "DESIGN.md 받기", d: "getdesign.md에서 좋아하는 서비스의 DESIGN.md를 받아 docs/에 두고 읽게 해요." },
      { t: "레퍼런스 스크린샷", d: "Mobbin, Refero에서 비슷한 화면을 찾아 이미지로 같이 줘요." },
      { t: "금지 목록", d: "이모지 아이콘, 보라 그라데이션, 모든 카드에 그림자, 가운데 정렬만 있는 화면. 미리 막아요." },
      { t: "컴포넌트는 가져다 쓰기", d: "shadcn/ui, 21st.dev 같은 검증된 부품을 쓰면 일관성이 생겨요." },
      { t: "한 번에 한 화면", d: "전체를 한 번에 바꾸지 말고 화면 하나씩. 마음에 들면 커밋해요." },
    ],
  },
  {
    title: "개발을 잘 시키는 법",
    art: "loop",
    lead: "프롬프트는 짧게, 문서는 자세하게. 디테일은 문서에 있으니 프롬프트엔 의도만 담아요.",
    points: [
      { t: "한 번에 한 단계", d: "\"Step 2만 해\"처럼 범위를 못 박아요. 다음 단계를 미리 하면 꼬여요." },
      { t: "계획부터", d: "Claude Code는 plan 모드(Shift+Tab), Codex는 \"계획부터 보여 줘\". 실행 전에 리뷰해요." },
      { t: "확인 방법까지 묻기", d: "\"끝나면 어떻게 확인하는지 알려 줘\"를 붙이면 테스트까지 같이 생각해요." },
      { t: "단계마다 커밋", d: "되돌릴 지점이 있어야 AI에게 과감하게 시킬 수 있어요." },
      { t: "규칙은 AGENTS.md에", d: "매번 말하는 규칙(패키지 금지, 키 위치)은 AGENTS.md/CLAUDE.md에 적어 두면 매번 안 말해도 돼요." },
    ],
  },
  {
    title: "막혔을 때",
    art: "stuck",
    lead: "AI한테 \"고쳐 줘\"만 반복하면 코드가 점점 이상해져요.",
    points: [
      { t: "원인 먼저", d: "에러 메시지를 그대로 붙이고, 고치기 전에 원인을 설명하게 해요." },
      { t: "같은 시도 두 번이면 멈추기", d: "git restore 로 돌아가고, 요청을 더 작게 쪼개요." },
      { t: "새 세션", d: "대화가 길어지면 AI가 앞을 잊어요. 결정을 docs/에 적고 새로 시작해요." },
      { t: "사람에게 묻기", d: "10분 넘게 혼자 붙잡지 않기. 옆 사람, 개발팀이 제일 빠를 때가 많아요." },
    ],
  },
  {
    title: "안전",
    art: "safe",
    lead: "AI가 짠 코드라도 책임은 내 거예요.",
    points: [
      { t: "키는 서버에만", d: "NEXT_PUBLIC_ 붙은 변수와 \"use client\" 파일엔 비밀 키가 들어가면 안 돼요." },
      { t: ".env는 커밋하지 않기", d: ".gitignore에 있는지 확인. 실수로 올렸으면 키부터 폐기해요." },
      { t: "패키지 추가는 신중하게", d: "AI가 처음 보는 패키지를 깔자고 하면 왜 필요한지 먼저 물어요." },
      { t: "돈, 권한은 직접 읽기", d: "결제, 인증, DB 권한(RLS) 코드는 한 줄씩 직접 확인해요." },
    ],
  },
];

export const HACKATHON = [
  "첫 30분: AI에게 질문을 받으면서 PRD.md를 같이 쓰고, 팀원 전원이 읽기",
  "DESIGN.md 하나 정하기 (getdesign.md) + 레퍼런스 화면 3장",
  "API.md에 데이터 모델, API 경계, 키 위치를 사람이 정하기",
  "AGENTS.md에 규칙 적기: 한 단계씩, 패키지 금지 목록, 키는 서버에만",
  "기능 하나마다: 계획 → 리뷰 → 실행 → 확인 → 커밋",
  "데모 2시간 전에는 새 기능 금지. 버그와 문구만",
];

/* ---------------- 자주 만나는 에러 (발표 자료 표 그대로, 단계별로 골라 보여 준다) ---------------- */

export const ERRORS: { sym: string; cause: string; fix: string; steps: string[] }[] = [
  { sym: 'Windows: "running scripts is disabled"', cause: "PowerShell 실행 정책", fix: "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned 입력 후 다시 실행", steps: ["setup"] },
  { sym: '"OPENAI_API_KEY가 .env.local에 없습니다"', cause: "dev 서버 재시작 안 함, 파일 위치나 이름 오타", fix: "Ctrl+C → npm run dev, .env.local이 프로젝트 맨 위 폴더에 있는지 확인", steps: ["s2"] },
  { sym: "OpenAI 401", cause: "키 복사 누락, 앞뒤 공백", fix: "키를 다시 복사해서 붙여넣기", steps: ["s2"] },
  { sym: "OpenAI 404 모델 없음", cause: "모델명 오타, 접근 권한", fix: "OPENAI_MODEL=gpt-5.4-mini 로 바꿔 보기", steps: ["s2"] },
  { sym: "OpenAI 400 Invalid schema", cause: "required 누락, additionalProperties 빠짐", fix: "docs/API.md 6번 strict 규칙대로 고쳐 달라고 하기", steps: ["s2", "s4"] },
  { sym: "42501 permission denied", cause: "schema.sql의 grant가 안 돌았음", fix: "SQL Editor에서 schema.sql 전체를 다시 Run", steps: ["s3"] },
  { sym: "PGRST205 테이블 없음", cause: "SQL을 안 돌렸거나 다른 프로젝트 URL", fix: "SQL 실행, .env.local의 SUPABASE_URL 확인", steps: ["s3"] },
  { sym: "목록이 계속 빔 / row-level security 에러", cause: "secret 자리에 publishable 키", fix: "sb_secret_로 시작하는 키로 바꾸기", steps: ["s3"] },
  { sym: "Uncached data ... outside of <Suspense>", cause: "Next 16 cacheComponents 기본값", fix: "그 페이지를 Suspense로 감싸 달라고 하기", steps: ["s4"] },
  { sym: "AI가 패키지를 깔고 파일을 잔뜩 고침", cause: "문서 밖 행동", fix: "git restore . 로 되돌리고 더 작게 다시 시키기", steps: ["s1", "s2", "s3", "s4"] },
];

/* ---------------- 과제 ---------------- */

export const ASSIGNMENT = {
  due: "10/28(수) 해커톤 사전 네트워킹 전까지",
  items: [
    { t: "Vercel 배포", d: "Session 6에서 한 그대로. Environment Variables에 OPENAI_API_KEY, OPENAI_MODEL, SUPABASE_URL, SUPABASE_SECRET_KEY 4개를 넣고 Redeploy" },
    { t: "P1 기능 1개 더", d: "마크다운 복사 버튼, 또는 /specs/[id] 상세 보기와 삭제" },
    { t: "해커톤 아이디어로 PRD 뽑기", d: "10/31에 팀원한테 바로 보여줄 PRD 하나 만들어 두기" },
  ],
  submit: "노션 과제 페이지에 GitHub 레포 링크 + 배포 링크. 이 노트 회고 단계의 링크 제출에도 넣어 두면 제출 현황에 떠요.",
};
