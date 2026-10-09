export type OS = "mac" | "win";

export type Command = { both?: string; mac?: string; win?: string };

export type Question = { id: string; label: string; hint?: string; input?: boolean; placeholder?: string };

export type Step = {
  id: string;
  label: string;
  start: string;
  title: string;
  lead: string;
  todo?: { label: string; cmd?: keyof typeof COMMANDS; os?: OS; note?: string }[];
  prompt?: string;
  ownPrompt?: boolean;
  design?: boolean;
  checks: { text: string; sub?: string }[];
  commit?: string;
  questions: Question[];
  chips: string[];
  summary?: boolean;
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
      { label: "프로젝트 만들기", cmd: "create" },
      { label: "Windows에서 에러가 나면", cmd: "winPolicy", os: "win" },
      { label: "문서팩 넣기", cmd: "pack" },
      { label: "GitHub에 올리기", cmd: "push" },
    ],
    checks: [
      { text: "localhost:3000에 Next 기본 화면이 떴다", sub: "확인했으면 Ctrl+C로 꺼 두기" },
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
    start: "0:16",
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
    id: "s1",
    label: "Step 1",
    start: "0:24",
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
      { label: "내 OpenAI 키 넣기", cmd: "envAi" },
      { label: "dev 서버 다시 켜기", cmd: "restart" },
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
      { label: "Supabase SQL Editor에서 supabase/schema.sql 전체를 붙여넣고 Run", note: "Success. No rows returned 가 나오면 성공" },
      { label: "Supabase 키 넣기", cmd: "envDb" },
      { label: "dev 서버 다시 켜기", cmd: "restart" },
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

export const REFS: { title: string; note: string; items: { name: string; desc: string; url: string }[] }[] = [
  {
    title: "DESIGN.md",
    note: "AI가 읽는 디자인 규칙 파일",
    items: [
      { name: "getdesign.md", desc: "브랜드별 DESIGN.md를 npx 한 줄로 받는 곳. 색, 타이포, 간격, 컴포넌트, 모션까지 들어 있어요", url: "https://getdesign.md" },
      { name: "awesome-design-md", desc: "Stripe, Linear, ElevenLabs 같은 실제 서비스를 분석한 DESIGN.md 모음", url: "https://github.com/VoltAgent/awesome-design-md" },
    ],
  },
  {
    title: "컴포넌트",
    note: "가져다 쓰는 UI 부품",
    items: [
      { name: "shadcn/ui", desc: "코드가 내 프로젝트로 복사되는 UI 라이브러리. 고치기 쉬워서 AI와 궁합이 좋아요", url: "https://ui.shadcn.com" },
      { name: "21st.dev", desc: "shadcn 기반 React 컴포넌트와 템플릿. AI에게 줄 프롬프트로도 복사돼요", url: "https://21st.dev" },
      { name: "Magic UI", desc: "움직임이 들어간 랜딩용 컴포넌트", url: "https://magicui.design" },
      { name: "Lucide", desc: "shadcn이 기본으로 쓰는 아이콘", url: "https://lucide.dev" },
    ],
  },
  {
    title: "화면 레퍼런스",
    note: "잘 만든 서비스 화면 보기",
    items: [
      { name: "Mobbin", desc: "실제 앱과 웹의 화면과 플로우를 단계별로 모아 둔 라이브러리", url: "https://mobbin.com" },
      { name: "Refero", desc: "실서비스 UI를 기능별로 검색. 온보딩, 결제, 빈 상태 같은 것", url: "https://refero.design" },
      { name: "Dribbble", desc: "디자이너 시안 모음. 분위기와 색 조합을 잡을 때", url: "https://dribbble.com" },
      { name: "Godly", desc: "움직임이 좋은 웹사이트 모음", url: "https://godly.website" },
      { name: "Awwwards", desc: "웹 디자인 어워드 수상작", url: "https://www.awwwards.com" },
      { name: "UI Bowl", desc: "국내 UI/UX 레퍼런스 큐레이션", url: "https://uibowl.io" },
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
    { t: "반복 작업", d: "비슷한 화면 여러 개, 타입 정리, 문구 일괄 수정." },
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

export const GUIDE_SECTIONS: { title: string; lead: string; points: { t: string; d: string }[] }[] = [
  {
    title: "PRD를 잘 쓰는 법",
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
