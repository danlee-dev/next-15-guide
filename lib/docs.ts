import { compete, firstSteps, moneyPrd } from "./clubDocs";
import { direct, figma, install } from "./devDocs";
import type { AgentTool, OS } from "./content";

// 자료실 페이지들. 화면(DocView)과 "페이지 복사"(pageMarkdown)가 같은 데이터를 읽는다.
// 수치와 명령어는 2026-10-10 공식 문서 기준 (knowledge/toolkit-research.md, knowledge/factcheck.md 에 출처).
// 문장 안의 `...` 는 코드 글씨로 보인다.

export type DocArtKind = "harness" | "loop" | "context" | "arch" | "reqflow" | "mcp" | "deploy" | "tracking" | "radius" | "squircle" | "motion";

export type Tool = { name: string; logo?: string; url: string; d: string };

export type Block =
  | { k: "p"; t: string; os?: OS; tool?: AgentTool }
  | { k: "points"; items: { t: string; d: string }[] }
  | { k: "steps"; items: string[]; os?: OS }
  | { k: "list"; items: string[] }
  | { k: "code"; label: string; both?: string; mac?: string; win?: string; tip?: string; tool?: AgentTool; where?: string; plain?: boolean }
  | { k: "prompt"; t: string; tool?: AgentTool }
  | { k: "table"; cols: string[]; rows: string[][] }
  | { k: "art"; name: DocArtKind; cap?: string }
  | { k: "shot"; src: string; alt: string; cap: string; href: string }
  | { k: "shots"; items: { src: string; alt: string; cap: string; w: number; h: number }[] }
  | { k: "tools"; items: Tool[]; ordered?: boolean }
  | { k: "warn"; title?: string; items: string[]; os?: OS }
  | { k: "go"; to: string; t: string };

export type DocSection = { title: string; note?: string; blocks: Block[] };

export type Doc = {
  id: string;
  label: string;
  chip: string;
  meta: string;
  title: string;
  lead: string;
  desc: string; // 자료실 목록에 쓰는 한 줄
  sections: DocSection[];
};

const L = (slug: string) => `/refs/logos/${slug}`;

/* ---------------- AI 이해하기 ---------------- */

const ai: Doc = {
  id: "ai",
  label: "AI 이해하기",
  chip: "AI",
  meta: "읽는 데 6분",
  title: "AI 코딩 도구는 이렇게 일해요",
  lead: "Claude Code와 Codex는 모델 하나가 아니라, 모델에 손발을 붙인 프로그램이에요. 구조를 알면 AI가 왜 틀리는지, 어떻게 시켜야 하는지가 보여요.",
  desc: "모델과 하네스, 에이전트 루프, 컨텍스트, 스킬·서브에이전트·훅",
  sections: [
    {
      title: "모델과 하네스",
      blocks: [
        { k: "art", name: "harness" },
        {
          k: "p",
          t: "모델(Claude, GPT)은 글을 읽고 다음 글을 써 내는 두뇌예요. 혼자서는 파일을 열지도, 명령을 실행하지도 못해요. Claude Code와 Codex는 그 바깥을 감싼 프로그램이에요. 도구(파일 읽기·수정, 터미널, 검색)를 쥐여 주고, 모델에게 무엇을 보여 줄지(컨텍스트)와 무엇을 허락할지(권한)를 관리해요. Claude Code 공식 문서는 이 바깥층을 하네스(agentic harness)라고 불러요.",
        },
        {
          k: "points",
          items: [
            { t: "모델", d: "생각하고 다음 행동을 고르는 부분이에요. `/model` 로 바꿀 수 있어요." },
            { t: "도구", d: "파일 읽기·수정, 터미널 실행, 웹 검색. 도구가 있어서 말만 하는 게 아니라 직접 고쳐요." },
            { t: "컨텍스트", d: "지금 모델에게 보이는 글 전부예요. 대화, 읽은 파일, CLAUDE.md, 명령 결과가 여기 쌓여요." },
            { t: "권한", d: "묻지 않고 해도 되는 일의 범위예요. 파일 수정, 명령 실행마다 물어보게 할 수 있어요." },
          ],
        },
      ],
    },
    {
      title: "한 번 시키면 안에서 도는 루프",
      blocks: [
        { k: "art", name: "loop" },
        {
          k: "p",
          t: "일을 맡기면 맥락 모으기, 행동하기, 확인하기를 반복해요(공식 문서의 agentic loop). 테스트를 돌리고, 에러를 읽고, 다시 고쳐요. 그래서 확인할 수단(빌드 명령, 테스트, 브라우저 스크린샷)을 같이 주면 결과가 확 좋아져요. Claude Code 모범 사례의 첫 항목이에요.",
        },
        { k: "prompt", t: "고친 다음 npm run build 로 확인하고, 통과할 때까지 고쳐 줘. 에러를 숨기지 말고 원인을 고쳐." },
      ],
    },
    {
      title: "AI가 틀리는 다섯 가지 이유",
      blocks: [
        { k: "art", name: "context", cap: "칸 크기는 예시예요. 실제로 무엇이 자리를 차지하는지는 Claude Code에서 /context 로 볼 수 있어요." },
        {
          k: "points",
          items: [
            { t: "컨텍스트가 차면 앞을 잊어요", d: "가득 차면 오래된 도구 결과부터 지우고, 그래도 모자라면 대화를 요약해요. 이때 초반 지시가 빠질 수 있어요. 지킬 규칙은 CLAUDE.md·AGENTS.md에 적고, 다른 일로 넘어갈 땐 `/clear`(Codex는 `/new`)." },
            { t: "학습 이후 바뀐 걸 몰라요", d: "라이브러리가 바뀌면 옛날 방식으로 써요. 공식 문서를 읽게 하거나 Context7 MCP를 붙여요. Next.js 16.2부터는 `node_modules/next/dist/docs/` 에 문서가 같이 들어 있어요." },
            { t: "내 프로젝트 사정을 몰라요", d: "무엇을 만들고 무엇을 안 만드는지는 알려 줘야 알아요. `docs/PRD.md`, `docs/API.md` 를 먼저 읽게 해요." },
            { t: "끝난 것처럼 보이면 멈춰요", d: "화면을 직접 안 보면 \"됐어요\"라고 해도 안 된 경우가 많아요. 증거(명령 출력, 스크린샷)를 달라고 해요." },
            { t: "모르면 그럴듯하게 지어내요", d: "없는 함수, 없는 옵션을 자신 있게 써요. 에러가 나면 고치기 전에 원인부터 설명하게 해요." },
          ],
        },
      ],
    },
    {
      title: "하네스를 내 프로젝트에 맞추기",
      note: "매번 같은 말을 하고 있다면",
      blocks: [
        { k: "p", t: "어디에 넣을지는 \"언제 읽혀야 하나\"로 정해요. 항상 지킬 규칙은 CLAUDE.md, 가끔 쓰는 긴 절차는 스킬, 반드시 일어나야 하는 일은 훅이에요." },
        {
          k: "table",
          cols: ["무엇", "언제 읽히나", "어디에 두나", "이럴 때"],
          rows: [
            ["CLAUDE.md / AGENTS.md", "세션 시작마다 항상", "프로젝트 맨 위 폴더", "빌드 명령, 키 위치, 금지 규칙"],
            ["스킬", "설명만 먼저, 쓸 때 본문까지", "`.claude/skills/이름/SKILL.md` (Codex는 `.agents/skills/`)", "배포 전 점검, 디자인 점검 같은 긴 절차"],
            ["서브에이전트", "따로 일하고 요약만 돌려줘요", "`.claude/agents/이름.md`", "넓게 뒤지는 조사, 코드 리뷰"],
            ["훅", "정해진 순간에 무조건 실행", "`.claude/settings.json`", "파일 고칠 때마다 포매터, 위험한 명령 막기"],
            ["MCP", "필요할 때 도구를 불러와요", "{{`claude mcp add`|`codex mcp add`}}", "Supabase, Vercel, 브라우저 연결"],
          ],
        },
        { k: "p", t: "CLAUDE.md는 짧을수록 잘 지켜요. Claude Code 문서는 200줄 아래로, \"이 줄을 지우면 AI가 실수할까?\"를 기준으로 줄이라고 해요. Claude Code는 CLAUDE.md가 없으면 AGENTS.md를 대신 읽어요." },
        {
          k: "code",
          label: "훅은 이렇게 생겼어요: Claude가 파일을 고칠 때마다 Prettier로 정리 (공식 문서 예시)",
          mac: `# .claude/settings.json (jq가 설치돼 있어야 해요)
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ]
  }
}`,
          win: `# .claude/settings.json 의 모양만 봐 두세요
# 이 예시는 jq, xargs 를 써서 Windows PowerShell 에서는 그대로 안 돌아요
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ]
  }
}`,
        },
      ],
    },
    {
      title: "권한 모드: 얼마나 맡길까",
      blocks: [
        {
          k: "table",
          cols: ["Claude Code 모드", "하는 일", "이럴 때"],
          rows: [
            ["Manual", "파일 수정, 명령 실행마다 물어봐요", "처음 배울 때"],
            ["Accept edits", "파일 수정은 알아서, 다른 명령은 물어봐요", "계획을 리뷰하고 실행할 때"],
            ["Plan", "읽기만 하고 계획을 세워요", "큰 작업을 시작하기 전"],
            ["Auto", "분류 모델이 위험한 행동만 막고 나머지는 진행", "손에 익은 뒤. v2.1.283부터 시작 기본값"],
          ],
        },
        { k: "p", t: "`Shift+Tab` 으로 돌려 가며 바꿔요. Codex는 세션 안에서 `/permissions` 로 바꾸고, 문서는 대부분의 작업에 Ask for approval을 권해요. git 폴더에서는 기본으로 폴더 안 수정은 하고, 폴더 밖 쓰기나 네트워크는 물어봐요." },
        { k: "warn", items: ["`--dangerously-skip-permissions`(Claude Code)와 `--yolo`(Codex)는 아무것도 묻지 않아요. 실습과 해커톤에서는 쓰지 마세요.", "되돌리기(`Esc` 두 번, `/rewind`)는 Claude가 편집한 파일만 돌려놔요. DB, 배포, 명령으로 바뀐 건 못 돌리니 git 커밋을 따로 해 둬요."] },
      ],
    },
    {
      title: "자주 쓰는 명령",
      blocks: [
        {
          k: "table",
          cols: ["하고 싶은 것", "Claude Code", "Codex"],
          rows: [
            ["프로젝트 설명서 만들기", "`/init`", "`/init`"],
            ["계획부터 받기", "`Shift+Tab` → plan, 또는 `/plan`", "`/plan`"],
            ["새 대화로 시작", "`/clear`", "`/new`"],
            ["대화를 요약해 공간 확보", "`/compact`", "`/compact`"],
            ["방금 전으로 되돌리기", "`Esc` 두 번, `/rewind`", "빈 입력창에서 `Esc` 두 번"],
            ["바뀐 코드 리뷰", "`/review`", "`/review`, `/diff`"],
            ["연결된 MCP 보기", "`/mcp`", "`/mcp`"],
            ["사용량·컨텍스트 보기", "`/usage`, `/context`", "`/status`"],
          ],
        },
        { k: "go", to: "mcp", t: "바깥 서비스를 연결하는 법은 MCP 연결에" },
      ],
    },
  ],
};

/* ---------------- 아키텍처 ---------------- */

const arch: Doc = {
  id: "arch",
  label: "아키텍처",
  chip: "구조",
  meta: "읽는 데 7분",
  title: "화면 뒤에서 무슨\u00a0일이 일어나나",
  lead: "웹 서비스는 브라우저, 서버, 데이터베이스, 외부 API가 요청을 주고받는 구조예요. 이 지도를 알면 AI에게 무엇을 어디에 만들라고 정확히 말할 수 있어요.",
  desc: "프론트·백엔드·DB·외부 API, 요청 흐름, 키 위치, 설계 순서",
  sections: [
    {
      title: "네 덩어리로 보기",
      blocks: [
        { k: "art", name: "arch" },
        {
          k: "points",
          items: [
            { t: "프론트엔드 (브라우저)", d: "사용자가 보는 화면이에요. 이 코드는 사용자 컴퓨터로 내려가서 누구나 개발자도구로 열어 볼 수 있어요." },
            { t: "백엔드 (서버)", d: "입력 검증, 다른 서비스 호출, 저장. 사용자 눈에 안 보여서 비밀 키는 여기서만 써요." },
            { t: "데이터베이스", d: "새로고침해도 남아야 하는 것. 오늘 실습은 Supabase(Postgres)의 specs 테이블이에요." },
            { t: "외부 API", d: "남이 만든 기능을 빌려 쓰기. OpenAI(글 생성), 결제, 지도 같은 것. 키가 있어야 응답해요." },
            { t: "환경 변수", d: "키와 설정값이에요. 코드에 쓰지 않고, 로컬은 `.env.local`, 배포는 Vercel 설정에 둬요." },
          ],
        },
      ],
    },
    {
      title: "버튼 하나를 누르면",
      note: "PRD 메이커 기준",
      blocks: [
        { k: "art", name: "reqflow" },
        { k: "p", t: "화살표 하나가 요청 하나예요. 에러가 나면 몇 번에서 끊겼는지부터 찾아요. 1과 4는 브라우저 개발자도구 Network 탭에서, 2와 3은 `npm run dev` 를 켜 둔 터미널에서 보여요." },
      ],
    },
    {
      title: "Next.js에서는 어디에 무엇을",
      blocks: [
        { k: "p", t: "Next.js는 프론트와 백엔드를 한 프로젝트에 둬요. 어디서 도는지는 파일 위치와 첫 줄로 정해져요." },
        {
          k: "table",
          cols: ["파일", "어디서 도나", "넣는 것"],
          rows: [
            ["`app/page.tsx`", "서버에서 그려서 보내요 (기본)", "화면 뼈대, DB에서 읽어 온 목록"],
            ["맨 위에 `\"use client\"` 가 있는 파일", "브라우저", "클릭, 입력, useState 같은 상호작용"],
            ["`app/api/…/route.ts`", "서버", "POST·GET 처리, 외부 API 호출, 저장"],
            ["`lib/*.ts`", "가져다 쓰는 쪽을 따라가요", "OpenAI·Supabase 호출 함수"],
            ["`.env.local`", "서버 (`NEXT_PUBLIC_` 이 붙은 것만 브라우저)", "키, 모델 이름"],
          ],
        },
        { k: "p", t: "키를 읽는 파일 맨 위에 `import \"server-only\"` 를 넣어 두면(`npm install server-only`), 실수로 브라우저 쪽 파일에서 가져다 쓸 때 빌드가 막아 줘요." },
      ],
    },
    {
      title: "키는 어디에",
      blocks: [
        {
          k: "table",
          cols: ["값", "생김새", "브라우저에 둬도 되나", ".env.local 이름"],
          rows: [
            ["Supabase Project URL", "`https://xxxx.supabase.co`", "돼요", "`SUPABASE_URL`"],
            ["Publishable key", "`sb_publishable_…`", "RLS 정책이 있을 때만", "오늘은 안 써요"],
            ["Secret key", "`sb_secret_…`", "절대 안 돼요", "`SUPABASE_SECRET_KEY`"],
            ["OpenAI API key", "`sk-…`", "절대 안 돼요", "`OPENAI_API_KEY`"],
          ],
        },
        {
          k: "list",
          items: [
            "`NEXT_PUBLIC_` 이 붙은 변수만 브라우저로 가요. 비밀 키에는 절대 붙이지 않아요.",
            "로컬은 `.env.local`, 배포는 Vercel의 Environment Variables. 둘 다 git에는 안 올라가요.",
            "키가 GitHub에 올라갔다면 파일을 지우는 걸로는 부족해요. 그 서비스에서 키를 새로 발급해요.",
          ],
        },
      ],
    },
    {
      title: "로그인이 붙으면",
      blocks: [
        {
          k: "points",
          items: [
            { t: "인증: 누구인지", d: "Supabase Auth(구글 로그인 등)가 로그인한 사용자의 id를 알려 줘요." },
            { t: "권한: 무엇을 할 수 있나", d: "RLS(행 수준 보안) 정책으로 \"내 행만 읽고 쓰기\"를 DB가 직접 막아요. 예: `user_id = auth.uid()`" },
            { t: "secret 키는 RLS를 건너뛰어요", d: "그래서 서버에서만 쓰고, 이 요청이 누구 것인지는 서버 코드가 직접 확인해야 해요." },
            { t: "RLS 켜고 정책 0개", d: "publishable 키로는 아무것도 못 읽어요. 오늘 실습이 이 구조예요. 서버만 secret 키로 접근해요." },
          ],
        },
      ],
    },
    {
      title: "AI에게 맡기기 전에 정할 것",
      note: "설계하는 순서",
      blocks: [
        {
          k: "steps",
          items: [
            "화면 목록: 페이지가 몇 개고, 각 화면에서 무엇을 보고 무엇을 누르나",
            "데이터: 테이블 이름, 컬럼, 누구 데이터인지(`user_id`)",
            "API 경계: 브라우저가 서버에 보내는 요청 목록. 주소, 입력, 출력, 실패할 때",
            "키와 외부 서비스: 어떤 키가 필요하고 어느 파일에서 읽나",
            "안 만드는 것: 이번에 일부러 빼는 기능",
          ],
        },
        { k: "p", t: "이걸 `docs/API.md` 한 장에 적어 두면 AI가 파일 구조를 마음대로 정하지 않아요. 오늘 문서팩의 API.md가 이 형식이에요." },
        { k: "prompt", t: "docs/PRD.md 를 읽고 docs/API.md 초안을 써 줘. 화면 목록, 테이블과 컬럼, API 목록(주소·입력·출력·실패), 필요한 키와 읽는 위치, 안 만드는 것. 코드는 아직 쓰지 마. 애매한 건 나한테 먼저 물어봐." },
        { k: "go", to: "deploy", t: "로컬에서 돌던 걸 인터넷에 올리는 건 배포·DB에" },
      ],
    },
  ],
};

/* ---------------- 개발 환경 세팅 ---------------- */

const env: Doc = {
  id: "env",
  label: "개발 환경 세팅",
  chip: "세팅",
  meta: "처음 한 번, 30분쯤",
  title: "새 노트북, 한\u00a0번에 세팅하기",
  lead: "위에서부터 순서대로 하면 돼요. 명령어는 위쪽 macOS / Windows 토글에 맞춰 바뀌어요. 이미 깔려 있으면 확인 명령만 쳐 보고 넘어가요.",
  desc: "Homebrew·winget, Node.js, Git, GitHub CLI, 에디터, Claude Code·Codex",
  sections: [
    {
      title: "이 순서로 깔아요",
      blocks: [
        {
          k: "tools",
          ordered: true,
          items: [
            { name: "Homebrew / winget", logo: L("homebrew.png"), url: "https://brew.sh", d: "명령 한 줄로 도구를 설치하는 관리자" },
            { name: "Node.js 24 LTS", logo: L("nodejs.svg"), url: "https://nodejs.org/en/download", d: "Next.js, npm, npx를 돌리는 실행 환경" },
            { name: "Git", logo: L("git.png"), url: "https://git-scm.com", d: "변경 기록. AI가 망쳐도 되돌릴 수 있어요" },
            { name: "GitHub CLI", logo: L("gh-cli.png"), url: "https://cli.github.com", d: "터미널에서 레포 만들기, PR, 로그인" },
            { name: "Claude Code 또는 Codex", logo: L("claude.svg"), url: "https://code.claude.com/docs/en/setup", d: "터미널에서 도는 AI 코딩 에이전트" },
          ],
        },
      ],
    },
    {
      title: "터미널 여는 법",
      blocks: [
        { k: "p", os: "mac", t: "`Cmd+Space` 로 Spotlight를 열고 \"터미널\"을 쳐요. VS Code를 쓰면 메뉴 Terminal > New Terminal로 프로젝트 폴더에서 바로 열려요." },
        { k: "p", os: "win", t: "시작 메뉴에서 \"Terminal\" 또는 \"PowerShell\"을 열어요. 줄 앞이 `PS C:\\` 로 시작하면 PowerShell이에요. 아래 명령은 PowerShell 기준이에요. VS Code를 쓰면 메뉴 Terminal > New Terminal로 열 수 있어요." },
      ],
    },
    {
      title: "1. 패키지 관리자",
      blocks: [
        {
          k: "code",
          label: "설치",
          mac: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# 끝에 나오는 "Next steps" 명령 두 줄을 그대로 실행하고, 터미널을 새로 열기
brew --version`,
          win: `# Windows 11과 최신 Windows 10에는 이미 들어 있어요
winget --version
# 없다고 나오면 Microsoft Store에서 "앱 설치 관리자(App Installer)"를 설치`,
        },
      ],
    },
    {
      title: "2. Node.js 24 LTS",
      blocks: [
        { k: "p", t: "제일 쉬운 건 nodejs.org에서 설치 파일(macOS는 .pkg, Windows는 .msi)을 받아 실행하는 거예요. 터미널이 편하면 아래 명령을 써요. 방법을 섞으면 버전이 꼬이니 하나만 써요." },
        { k: "shot", src: "/refs/nodejs.webp", alt: "Node.js 다운로드 페이지", cap: "nodejs.org/en/download. LTS(24)를 고르면 돼요", href: "https://nodejs.org/en/download" },
        {
          k: "code",
          label: "터미널로 설치하고 확인",
          mac: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
# 터미널을 닫았다가 새로 열고
nvm install 24
node -v`,
          win: `winget install OpenJS.NodeJS.LTS
# PowerShell을 닫았다가 새로 열고
node -v`,
        },
      ],
    },
    {
      title: "3. Git과 GitHub CLI",
      blocks: [
        {
          k: "code",
          label: "설치",
          mac: `xcode-select --install   # git이 들어 있는 Apple 개발 도구. 창이 뜨면 설치
brew install gh`,
          win: `winget install --id Git.Git -e --source winget
winget install --id GitHub.cli --source winget
# PowerShell을 닫았다가 새로 열어야 git, gh 가 잡혀요`,
        },
        {
          k: "code",
          label: "처음 한 번: 이름, 이메일, GitHub 로그인",
          both: `git config --global user.name "내 이름"
git config --global user.email "깃허브에 등록한 이메일"
gh auth login   # GitHub.com → HTTPS → 브라우저로 로그인`,
          tip: "이름·이메일이 없으면 첫 커밋이 \"Please tell me who you are\"로 멈춰요. gh 로그인을 해 두면 git push 때 비밀번호를 묻지 않아요.",
        },
      ],
    },
    {
      title: "4. 에디터",
      blocks: [
        {
          k: "code",
          label: "VS Code 설치 (설치 파일로 받아도 돼요)",
          mac: `brew install --cask visual-studio-code`,
          win: `winget install -e --id Microsoft.VisualStudioCode`,
          tip: "Cursor를 써도 돼요. 에디터 안의 터미널에서 Claude Code나 Codex를 켜면 바뀐 파일을 옆에서 바로 볼 수 있어요.",
        },
      ],
    },
    {
      title: "5. AI 에이전트",
      note: "둘 중 하나만 있어도 돼요",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Claude Code", logo: L("claude.svg"), url: "https://code.claude.com/docs/en/setup", d: "Claude Pro 이상 구독 또는 API 키. 무료 플랜에는 없어요" },
            { name: "Codex CLI", logo: L("codex-mark.png"), url: "https://learn.chatgpt.com/docs/codex/cli", d: "ChatGPT Plus 이상 구독 또는 API 키" },
          ],
        },
        {
          k: "code",
          tool: "claude",
          label: "Claude Code 설치 (공식 권장 방식, 자동 업데이트)",
          mac: `curl -fsSL https://claude.ai/install.sh | bash
claude --version`,
          win: `irm https://claude.ai/install.ps1 | iex
claude --version`,
          tip: "npm으로 설치할 때 sudo 를 붙이지 마세요(공식 문서 경고). 위 방식은 Node가 없어도 돼요.",
        },
        {
          k: "code",
          tool: "codex",
          label: "Codex 설치",
          mac: `curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex --version`,
          win: `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
codex --version`,
        },
        {
          k: "code",
          label: "프로젝트 폴더에서 처음 실행",
          both: `cd prd-maker
{{claude|codex}}    # 처음이면 브라우저가 열려요. 로그인하기
# 켜진 다음 /init 을 치면 프로젝트 설명서({{CLAUDE.md|AGENTS.md}})를 만들어 줘요`,
        },
        { k: "go", to: "install", t: "채팅 앱과 뭐가 다른지, 다른 설치 방법과 막힐 때: Claude Code·Codex 설치" },
      ],
    },
    {
      title: "다 됐는지 한 번에 확인",
      blocks: [
        {
          k: "code",
          label: "버전이 하나씩 나오면 성공",
          both: `node -v
git --version
gh --version
{{claude --version|codex --version}}`,
          tip: "안 깐 도구는 \"command not found\"(Windows는 \"인식되지 않습니다\")가 떠요. 방금 깔았는데 그렇다면 터미널을 새로 열고 다시 쳐 봐요.",
        },
      ],
    },
    {
      title: "자주 막히는 곳",
      blocks: [
        {
          k: "warn",
          os: "mac",
          items: [
            "`brew: command not found`: Homebrew 설치 끝에 나온 Next steps 두 줄을 안 친 거예요. 그 두 줄을 치고 새 터미널을 열어요.",
            "`EACCES` 권한 에러로 sudo 를 붙이라고 할 때: 붙이지 말고 `npx 도구이름` 으로 실행하거나, Node를 nvm으로 다시 깔아요.",
            "`xcode-select` 창이 떴다면 설치를 누르고 몇 분 기다려요. 그동안 git 명령은 안 돼요.",
          ],
        },
        {
          k: "warn",
          os: "win",
          items: [
            "`running scripts is disabled`: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 를 치고 다시 실행해요.",
            "설치했는데 명령을 못 찾을 때: PowerShell을 닫고 새로 열어요. 설치 때 바뀐 경로(PATH)는 새 창부터 잡혀요.",
            "Claude Code는 Git for Windows가 있으면 Git Bash로 명령을 실행해요. Git을 먼저 깔아 두면 덜 막혀요.",
          ],
        },
        { k: "go", to: "mcp", t: "다음은 AI에게 브라우저와 서비스를 연결하는 MCP 연결" },
      ],
    },
  ],
};

/* ---------------- MCP 연결 ---------------- */

const mcp: Doc = {
  id: "mcp",
  label: "MCP 연결",
  chip: "MCP",
  meta: "필요할 때 하나씩",
  title: "AI에게 바깥\u00a0서비스를 연결하기",
  lead: "MCP를 연결하면 AI가 Supabase 테이블, Vercel 배포 로그, 브라우저 화면을 직접 보고 다뤄요. 대시보드를 보고 복사해서 붙여넣던 일이 줄어요. 대신 내 계정 권한으로 움직이니까 좁게 연결해요.",
  desc: "MCP가 뭔지, 브라우저·Context7, Supabase·Vercel·Railway 연결",
  sections: [
    {
      title: "MCP가 뭐예요",
      blocks: [
        { k: "art", name: "mcp" },
        { k: "p", t: "MCP(Model Context Protocol)는 AI 에이전트가 바깥 서비스를 쓰는 표준 연결 방식이에요. 충전 단자가 USB-C 하나로 통일된 것처럼, 서비스마다 다른 API를 에이전트 쪽에서는 같은 방식으로 꽂아 써요. Claude Code와 Codex 둘 다 지원해요." },
        {
          k: "table",
          cols: ["연결 전", "연결 후"],
          rows: [
            ["Table Editor에서 컬럼을 보고 AI에게 타이핑해 줘요", "\"specs 테이블 구조 보고 타입 맞춰서 폼 만들어 줘\""],
            ["배포 실패 → 빌드 로그 복사 → 붙여넣기", "\"최근 배포가 왜 실패했는지 로그 보고 고쳐 줘\""],
            ["화면을 직접 열어 눌러 보고 스크린샷을 찍어 줘요", "\"localhost:3000 열어서 버튼 눌러 보고 스크린샷으로 확인해\""],
          ],
        },
      ],
    },
    {
      title: "공통 명령",
      blocks: [
        {
          k: "code",
          tool: "claude",
          label: "Claude Code",
          both: `# 원격(인터넷 주소) 서버
claude mcp add --transport http <이름> <주소>
# 내 컴퓨터에서 실행하는 서버: -- 뒤가 실행할 명령
claude mcp add <이름> -- npx -y <패키지>

claude mcp list          # 연결 상태 (Connected / Needs authentication)
claude mcp remove <이름>
# 로그인이 필요한 서버: claude 를 켜고 /mcp → 서버 선택 → Authenticate`,
        },
        {
          k: "code",
          tool: "codex",
          label: "Codex",
          both: `codex mcp add <이름> -- <실행 명령>   # 내 컴퓨터에서 실행
codex mcp add <이름> --url <주소>      # 원격
codex mcp login <이름>                  # 로그인이 필요한 서버
codex mcp list
# 설정은 ~/.codex/config.toml 에 저장돼요`,
        },
        { k: "p", tool: "claude", t: "Claude Code는 저장 범위를 고를 수 있어요. 기본 local(이 프로젝트, 나만), `--scope project`(`.mcp.json` 으로 git에 올라가 팀이 같이 씀), `--scope user`(내 모든 프로젝트)." },
        { k: "warn", items: ["토큰이나 API 키가 들어간 설정은 `--scope project` 로 저장하지 마세요. `.mcp.json` 이 git에 올라가요."] },
      ],
    },
    {
      title: "먼저 넣을 세 가지",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Playwright MCP", logo: L("playwright-mcp.svg"), url: "https://github.com/microsoft/playwright-mcp", d: "AI가 브라우저를 열어 클릭·입력·스크린샷으로 직접 확인해요" },
            { name: "Next.js MCP", logo: L("nextjs-mcp.png"), url: "https://nextjs.org/docs/app/guides/mcp", d: "켜져 있는 npm run dev 의 에러·라우트·로그를 AI가 읽어요" },
            { name: "Context7", logo: L("context7.png"), url: "https://context7.com", d: "Supabase, shadcn 같은 라이브러리의 최신 문서를 넣어 줘요" },
          ],
        },
        {
          k: "code",
          tool: "claude",
          label: "Claude Code에 추가",
          both: `claude mcp add playwright -- npx @playwright/mcp@latest
claude mcp add next-devtools -- npx next-devtools-mcp@latest
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp`,
        },
        {
          k: "code",
          tool: "codex",
          label: "Codex에 추가",
          both: `codex mcp add playwright -- npx @playwright/mcp@latest
codex mcp add next-devtools -- npx next-devtools-mcp@latest
codex mcp add context7 -- npx -y @upstash/context7-mcp`,
          tip: "Codex를 Windows에서 쓰면 next-devtools 는 config.toml 에 환경 변수를 더 넣어야 해요(README 안내). 막히면 Playwright와 Context7부터 쓰세요.",
        },
        { k: "prompt", t: "localhost:3000 열어서 아이디어를 넣고 PRD 만들기를 눌러 봐. 카드가 뜨는지 스크린샷으로 보여 주고, 375px 모바일 폭에서도 한 번 확인해." },
        { k: "p", t: "콘솔 에러나 네트워크 요청까지 봐야 하면 Playwright 대신 Chrome DevTools MCP(`npx chrome-devtools-mcp@latest`)를 써도 돼요. 브라우저용은 둘 중 하나면 충분해요." },
      ],
    },
    {
      title: "Supabase MCP",
      note: "읽기 전용 + 프로젝트 하나로",
      blocks: [
        { k: "shot", src: "/refs/supabase-mcp.webp", alt: "Supabase MCP 공식 문서", cap: "공식 문서에서 Read-only와 기능 묶음을 골라 주소를 만들 수 있어요", href: "https://supabase.com/docs/guides/ai-tools/mcp" },
        { k: "p", t: "프로젝트 ref는 대시보드 주소 `supabase.com/dashboard/project/<ref>` 의 `<ref>` 부분이에요. 주소에 `&` 가 있어서 따옴표가 꼭 필요해요." },
        {
          k: "code",
          tool: "claude",
          label: "Claude Code에 연결 (로그인은 브라우저로)",
          both: `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"
# claude 를 켜고 /mcp → supabase → Authenticate`,
        },
        {
          k: "code",
          tool: "codex",
          label: "Codex에 연결 (로그인은 브라우저로)",
          both: `codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"
codex mcp login supabase`,
        },
        {
          k: "points",
          items: [
            { t: "project_ref", d: "이 프로젝트 하나만. 빼면 내 계정의 모든 프로젝트에 닿아요." },
            { t: "read_only=true", d: "읽기 전용 사용자로 SQL을 실행해요. 테이블을 못 바꿔요." },
            { t: "features=database,docs", d: "필요한 도구 묶음만 켜요. 도구가 줄어서 토큰도 덜 써요." },
          ],
        },
        { k: "prompt", t: "Supabase에 있는 테이블 목록과 각 테이블의 RLS 정책을 요약해 줘. 고치지는 마." },
        { k: "warn", items: ["내 개발자 권한으로 움직여요. 해커톤에서는 개발용 프로젝트에만 연결해요.", "쓰기를 열면 테이블을 바꿀 수 있어요. 스키마 변경은 SQL 파일로 남기는 습관이 안전해요.", "테이블 안의 사용자 입력에 숨은 지시문이 AI를 속일 수 있어요. 도구 실행 승인은 읽고 눌러요."] },
      ],
    },
    {
      title: "Vercel MCP",
      note: "배포 로그를 AI가 직접",
      blocks: [
        { k: "shot", src: "/refs/vercel-mcp.webp", alt: "Vercel MCP 공식 문서", cap: "설치할 것 없이 공식 주소 하나로 연결해요", href: "https://vercel.com/docs/agent-resources/vercel-mcp" },
        {
          k: "code",
          tool: "claude",
          label: "Claude Code에 연결",
          both: `claude mcp add --transport http vercel https://mcp.vercel.com
# claude 를 켜고 /mcp → vercel → Authenticate → 접근할 팀 고르기`,
        },
        {
          k: "code",
          tool: "codex",
          label: "Codex에 연결",
          both: `codex mcp add vercel --url https://mcp.vercel.com
# 추가할 때 브라우저가 열려요. 안 열리면
codex mcp login vercel`,
        },
        { k: "prompt", t: "my-app 최신 프로덕션 배포의 에러를 확인하고, 어떤 라우트에서 나는지 정리해 줘. 아직 고치지 마." },
        { k: "warn", items: ["읽기 전용 모드가 없어요. 로그인할 때 필요한 팀만 허용해요.", "도구가 200개가 넘어요(환경 변수, 도메인 구매 포함). 승인 창은 꼭 읽고 눌러요.", "공식 주소는 `https://mcp.vercel.com` 하나예요."] },
      ],
    },
    {
      title: "Railway MCP",
      note: "백엔드를 Railway에 올렸을 때",
      blocks: [
        { k: "p", t: "Railway는 계속 켜져 있어야 하는 서버(웹소켓, 백그라운드 작업, 오래 도는 크롤러)나 DB를 올리는 곳이에요. 거기 올린 서비스의 로그, 환경 변수, 재배포를 AI가 다루게 해 줘요." },
        {
          k: "code",
          label: "Railway CLI 설치 + 로그인",
          mac: `brew install railway
railway login`,
          win: `npm i -g @railway/cli
railway login`,
        },
        {
          k: "code",
          label: "에이전트에 등록 (제일 간단한 방법)",
          both: `{{railway mcp install --agent claude-code|railway mcp install --agent codex}}
# CLI 없이 OAuth로 연결하는 방법도 있어요 (Railway MCP 문서)`,
          tip: "OAuth 방식은 승인할 때 워크스페이스와 프로젝트를 골라 범위를 좁힐 수 있어요.",
        },
        { k: "warn", items: ["재배포, 서비스·도메인·볼륨 삭제 같은 도구가 있어요. 확인 창에서 대상 서비스와 환경 이름을 읽고 눌러요.", "새 서비스나 DB를 만들면 요금이 생길 수 있어요."] },
      ],
    },
    {
      title: "더 있어요",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Figma MCP", logo: L("figma-mcp.png"), url: "https://developers.figma.com/docs/figma-mcp-server/", d: "Figma 화면을 코드로, 흐름도와 화면 초안을 Figma로. 도구별 연결은 자료실 'Figma MCP 연결'. 무료 좌석은 월 호출 수가 적어요" },
            { name: "shadcn MCP", logo: L("shadcn-mcp.png"), url: "https://ui.shadcn.com/docs/mcp", d: "shadcn 컴포넌트를 찾아서 설치" },
            { name: "GitHub", logo: L("gh-cli.png"), url: "https://cli.github.com", d: "MCP보다 gh CLI가 토큰을 덜 써서 공식 모범 사례도 gh를 권해요" },
          ],
        },
      ],
    },
    {
      title: "안전 수칙",
      blocks: [
        {
          k: "list",
          items: [
            "공식 주소인지 확인하고, 처음엔 읽기 전용·프로젝트 하나로 좁혀서 연결해요.",
            "안 쓰는 서버는 지워요(`claude mcp remove`). 도구 목록도 컨텍스트를 먹어요.",
            "로그, DB 데이터, 웹페이지 안의 글이 AI를 속일 수 있어요(프롬프트 인젝션). 쓰기·삭제 승인은 직접 읽고 눌러요.",
            "운영 데이터가 있는 프로젝트에는 연결하지 않는 게 기본이에요.",
          ],
        },
      ],
    },
  ],
};

/* ---------------- 배포·DB ---------------- */

const deploy: Doc = {
  id: "deploy",
  label: "배포·DB",
  chip: "배포",
  meta: "과제 마감 10/26(월)",
  title: "인터넷에 올리고, 데이터를 남기기",
  lead: "내 노트북에서만 돌던 앱을 누구나 여는 주소로 올리는 게 배포예요. 코드는 GitHub, 서버는 Vercel, 데이터는 Supabase가 맡아요.",
  desc: "Supabase 프로젝트·테이블·RLS, Vercel 배포와 환경 변수, 배포 후 디버깅",
  sections: [
    {
      title: "전체 흐름",
      blocks: [
        { k: "art", name: "deploy" },
        { k: "p", t: "한 번 연결해 두면 그다음부터는 `git push` 만 하면 Vercel이 알아서 다시 빌드하고 올려요. 키는 코드가 아니라 Vercel 설정에 넣어 두고, 서버가 Supabase와 OpenAI를 부를 때 꺼내 써요." },
      ],
    },
    {
      title: "Supabase 프로젝트 만들기",
      blocks: [
        {
          k: "steps",
          items: [
            "supabase.com 에 로그인하고 New project를 눌러요.",
            "이름과 Database Password를 정해요(비밀번호는 따로 저장). Region은 Northeast Asia (Seoul)이 가까워요.",
            "\"Automatically expose new tables\" 옵션이 보이면: 꺼져 있으면 테이블마다 권한(grant)을 직접 줘야 해요. 오늘 schema.sql에 이미 들어 있어요.",
            "만들어지면 화면 위쪽 Connect 버튼에서 Project URL을 복사해요.",
            "Settings > API Keys 의 Secret keys에서 `sb_secret_` 로 시작하는 키를 복사해요.",
            "SQL Editor > New query에 schema.sql을 붙여넣고 Run. \"Success. No rows returned\"가 뜨면 성공이에요.",
          ],
        },
        {
          k: "shots",
          items: [
            { src: "/refs/dash/supabase-home.webp", alt: "Supabase 프로젝트 첫 화면", cap: "프로젝트 첫 화면. 위쪽 초록 Connect 버튼, 또는 주소 옆 Copy로 Project URL을 복사해요", w: 1400, h: 671 },
            { src: "/refs/dash/supabase-connect-env.webp", alt: "Supabase Connect 창", cap: "Connect 창 아래쪽 .env.local 탭. https://로 시작하는 주소만 SUPABASE_URL에 넣어요", w: 647, h: 400 },
            { src: "/refs/dash/supabase-keys.webp", alt: "Supabase API Keys 설정", cap: "Settings > API Keys. Secret keys 줄의 복사 버튼으로 sb_secret_ 키를 복사해요", w: 1098, h: 708 },
            { src: "/refs/dash/supabase-sql.webp", alt: "Supabase SQL Editor", cap: "SQL Editor. schema.sql을 붙여넣고 오른쪽 위 Run을 눌러요", w: 1098, h: 708 },
          ],
        },
        { k: "warn", items: ["secret 키는 RLS를 건너뛰는 마스터키예요. `.env.local` 과 Vercel 환경 변수에만 두고, 브라우저 코드와 git에는 절대 넣지 않아요.", "SQL Editor에서 \"Potential issue detected\" 창이 뜨면 내용을 읽고, 의도한 거면 실행을 눌러요."] },
      ],
    },
    {
      title: "테이블 권한, 한 번에 이해하기",
      blocks: [
        {
          k: "points",
          items: [
            { t: "grant: 테이블에 손댈 수 있나", d: "없으면 secret 키로도 `42501 permission denied` 가 나요." },
            { t: "RLS: 어떤 행을 볼 수 있나", d: "테이블마다 켜요. 켜고 정책이 없으면 publishable 키로는 아무것도 못 해요." },
            { t: "정책: 누가 무엇을", d: "로그인 서비스라면 \"내 행만\". 예: `user_id = auth.uid()`" },
            { t: "눈으로 확인", d: "Table Editor에서 데이터가 실제로 들어왔는지 봐요." },
          ],
        },
        {
          k: "code",
          label: "권한이 붙었는지 확인 (SQL Editor)",
          both: `select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'specs';`,
          tip: "결과에 service_role 이 보이면 서버(secret 키)에서 접근할 수 있어요.",
        },
      ],
    },
    {
      title: "Vercel에 올리기",
      blocks: [
        {
          k: "steps",
          items: [
            "코드가 GitHub에 push돼 있는지 확인해요(`git status` 가 깨끗하고 `git push` 까지).",
            "vercel.com 에 GitHub 계정으로 로그인하고 Add New… > Project를 눌러요.",
            "내 레포 옆 Import를 눌러요. 처음이면 Vercel이 GitHub 레포를 읽도록 허용하는 창이 떠요.",
            "Framework Preset이 Next.js로 잡혔는지 봐요.",
            "Environment Variables에 `OPENAI_API_KEY`, `OPENAI_MODEL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` 4개를 넣어요.",
            "Deploy를 누르고 1~2분 기다리면 `https://프로젝트이름.vercel.app` 같은 주소가 생겨요.",
          ],
        },
        {
          k: "shots",
          items: [
            { src: "/refs/dash/vercel-new.webp", alt: "Vercel 새 프로젝트 화면", cap: "Add New… > Project. 왼쪽 목록에서 내 레포 옆 Import를 눌러요", w: 1217, h: 627 },
            { src: "/refs/dash/vercel-env-add.webp", alt: "Vercel 환경 변수 추가 창", cap: "환경 변수 추가. Key에 이름, Value에 값. Secret으로 두면 저장 뒤 값이 다시 안 보여요. .env.local 내용을 통째로 붙여넣어도 돼요", w: 986, h: 770 },
            { src: "/refs/dash/vercel-env.webp", alt: "Vercel 환경 변수 목록", cap: "저장된 목록. 값은 가려져요 (이 사이트의 화면이라 이름은 실습과 달라요)", w: 1120, h: 681 },
          ],
        },
        { k: "p", t: "그다음부터는 main 브랜치에 push할 때마다 자동으로 다시 배포돼요. main이 아닌 브랜치를 push하면 미리보기(Preview) 주소가 따로 생겨요." },
        { k: "warn", items: ["환경 변수를 바꿔도 이미 올라간 배포에는 반영이 안 돼요. Deployments에서 Redeploy를 눌러 새로 배포해야 해요(Vercel 문서).", "`.env.local` 은 GitHub에 안 올라가서 Vercel이 못 읽어요. 키는 Vercel 화면에 직접 넣어요."] },
        { k: "shot", src: "/refs/vercel-cli.webp", alt: "Vercel CLI 문서", cap: "화면 대신 터미널로 하고 싶으면 Vercel CLI", href: "https://vercel.com/docs/cli" },
        {
          k: "code",
          label: "터미널로 할 때 (Vercel CLI)",
          both: `npm i -g vercel        # 권한 에러가 나면 sudo 대신 npx vercel 로
vercel login
vercel link            # 이 폴더를 Vercel 프로젝트에 연결
vercel env add OPENAI_API_KEY production   # 값은 물어볼 때 붙여넣기
vercel --prod          # 프로덕션 배포`,
          tip: "`echo 키 | vercel env add` 처럼 값을 명령에 직접 쓰면 터미널 기록에 남아요. 물어볼 때 붙여넣는 방식을 써요.",
        },
      ],
    },
    {
      title: "배포했는데 안 될 때",
      blocks: [
        {
          k: "table",
          cols: ["증상", "먼저 볼 곳"],
          rows: [
            ["배포가 빨갛게 실패", "Vercel Deployments → 그 배포 → Build Logs. 로컬에서 `npm run build` 로 같은 에러가 나는지"],
            ["로컬은 되는데 배포 주소에서 500", "환경 변수 4개가 다 있는지 → Redeploy → Logs 탭"],
            ["목록이 비어 있음, permission denied", "secret 키를 넣었는지(publishable 아닌지), grant, RLS"],
            ["예전 화면이 그대로", "최신 커밋이 push됐는지, Deployments 맨 위 배포가 Ready인지"],
          ],
        },
        { k: "prompt", t: "Vercel 배포가 실패했어. 아래는 Build Logs 마지막 부분이야. 원인을 먼저 설명하고, 로컬에서 npm run build 로 같은 에러를 재현한 다음 고쳐 줘.\n[로그 붙여넣기]" },
      ],
    },
    {
      title: "Railway는 언제 쓰나",
      blocks: [
        { k: "p", t: "Vercel의 서버는 요청이 올 때 실행되는 함수예요. 계속 켜져 있어야 하는 서버(웹소켓, 백그라운드 작업자, 오래 도는 크롤러)는 Railway 같은 곳에 따로 올려요. 해커톤 웹앱은 대부분 Vercel + Supabase로 충분해요." },
        { k: "go", to: "mcp", t: "Railway를 AI와 연결하는 법은 MCP 연결에" },
      ],
    },
  ],
};

/* ---------------- 디자인 디테일 ---------------- */

const design: Doc = {
  id: "design",
  label: "디자인 디테일",
  chip: "디자인",
  meta: "AI에게 그대로 시켜도 돼요",
  title: "한\u00a0끗 차이는 디테일에서 나와요",
  lead: "글꼴, 자간, 모서리, 간격, 움직임. 하나씩은 작아도 다 맞으면 \"AI가 만든 것 같은\" 느낌이 사라져요. 수치는 공식 자료에서 가져왔어요.",
  desc: "Pretendard, 자간·줄 간격, 둥근 모서리, 간격, 모션, 대비",
  sections: [
    {
      title: "한글 글꼴은 Pretendard",
      blocks: [
        { k: "p", t: "한국어 서비스에서 가장 많이 쓰는 무료 글꼴이에요(SIL OFL, 상업적 사용 가능). 가변 글꼴 파일 하나로 굵기를 자유롭게 써요." },
        {
          k: "code",
          label: "설치하고 글꼴 파일 복사",
          mac: `npm i pretendard
mkdir -p app/fonts && cp node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 app/fonts/`,
          win: `npm i pretendard
New-Item -ItemType Directory -Force app/fonts
Copy-Item node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 app/fonts/`,
        },
        {
          k: "code",
          label: "app/layout.tsx",
          both: `import localFont from "next/font/local";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

// <html lang="ko" className={pretendard.variable}> 로 붙이기`,
          tip: "weight: \"45 920\" 은 Pretendard README가 권하는 값이에요. 빼면 Safari에서 굵기가 틀어질 수 있어요.",
        },
      ],
    },
    {
      title: "자간과 줄 간격",
      blocks: [
        { k: "art", name: "tracking" },
        {
          k: "points",
          items: [
            { t: "본문 자간은 0", d: "Pretendard는 따로 줄이지 않아도 되게 만들어졌어요(공식 README). 줄여도 -0.01em 정도까지만." },
            { t: "제목만 살짝 좁게", d: "-0.01em ~ -0.02em. 아주 큰 제목만 화면을 보면서 -0.03em까지." },
            { t: "본문 줄 간격 1.6", d: "1.5 ~ 1.7이 읽기 편해요(WCAG, W3C 한글 조판 요구사항). 제목은 1.2 ~ 1.3처럼 좁게." },
            { t: "줄바꿈은 keep-all", d: "한글이 단어 중간에서 안 끊겨요. 긴 URL이 삐져나오지 않게 `overflow-wrap: anywhere` 를 같이 써요." },
          ],
        },
        {
          k: "code",
          label: "globals.css",
          both: `body {
  font-family: var(--font-pretendard), sans-serif;
  line-height: 1.6;
  letter-spacing: 0;
  word-break: keep-all;
  overflow-wrap: anywhere;
}
h1, h2 { line-height: 1.25; letter-spacing: -0.02em; }`,
        },
      ],
    },
    {
      title: "위계는 크기, 굵기, 색으로",
      blocks: [
        {
          k: "points",
          items: [
            { t: "크기는 몇 단계만", d: "예: 13 · 15 · 17 · 24 · 40px. 단계가 많으면 뭐가 중요한지 흐려져요." },
            { t: "굵기는 두세 개", d: "보통 400(본문) · 600(강조) · 700(제목). 비슷한 굵기를 섞지 않아요." },
            { t: "글자색 세 단계", d: "제목(가장 진하게) · 본문 · 보조 설명(흐리게). 색을 늘리는 대신 진하기로 나눠요." },
            { t: "강조는 한 화면에 하나", d: "다 굵고 다 컬러면 아무것도 안 보여요. 버튼 하나만 진하게." },
          ],
        },
      ],
    },
    {
      title: "둥근 모서리",
      blocks: [
        { k: "art", name: "radius" },
        { k: "p", t: "카드 안에 또 둥근 상자를 넣을 때는 안쪽 radius = 바깥 radius − 사이 여백으로 맞춰요. 그래야 두 모서리가 나란해 보여요. Apple이 WWDC23·25에서 권한 방법이에요. 여백이 radius보다 크면 안쪽은 작은 최소값(예: 8px)을 써요." },
        {
          k: "points",
          items: [
            { t: "큰 것은 크게, 작은 것은 작게", d: "큰 카드 24~28px, 입력창 12~14px, 작은 칩은 둥근 알약(999px). 28/20/14px은 예시 값이에요." },
            { t: "한 화면에 radius 종류는 적게", d: "세 단계 정도를 토큰으로 정해 두고 그것만 써요." },
          ],
        },
        { k: "art", name: "squircle" },
        { k: "p", t: "Apple 화면의 둥근 모서리는 원을 붙인 모양이 아니라 곡률이 서서히 변하는 연속 곡선(continuous corner)이에요. SwiftUI에서는 `RoundedRectangle(cornerRadius: 20, style: .continuous)`, Figma에서는 모서리의 Corner smoothing 값(iOS 느낌은 60%)으로 만들어요. 웹 CSS는 `corner-shape: squircle` 이 새로 생겼지만 아직 일부 브라우저만 지원해서, 지원할 때만 켜요." },
        {
          k: "code",
          label: "웹에서 연속 곡선 쓰기 (지원하는 브라우저에서만 바뀌어요)",
          both: `.card { border-radius: 28px; }

@supports (corner-shape: squircle) {
  /* 같은 값이면 덜 둥글어 보여서 조금 키워요 */
  .card { corner-shape: squircle; border-radius: 40px; }
}`,
        },
        {
          k: "code",
          label: "토큰으로 정해 두기",
          both: `:root { --r-xl: 28px; --r-lg: 20px; --r-md: 14px; }
.card { border-radius: var(--r-xl); padding: 8px; }
.card > .inner { border-radius: var(--r-lg); } /* 28 - 8 = 20 */`,
        },
      ],
    },
    {
      title: "간격",
      blocks: [
        {
          k: "points",
          items: [
            { t: "4의 배수로", d: "4 · 8 · 12 · 16 · 24 · 32 · 48. Material 3도 4dp 단위를 써요. 아무 숫자나 쓰면 줄이 안 맞아요." },
            { t: "묶음 안은 좁게, 묶음 사이는 넓게", d: "제목과 설명은 8, 카드와 카드는 16, 섹션과 섹션은 48 이상. 선을 긋지 않아도 묶음이 보여요." },
            { t: "선보다 여백", d: "구분선, 테두리를 늘리기 전에 간격부터 벌려 봐요." },
          ],
        },
      ],
    },
    {
      title: "모션",
      blocks: [
        { k: "art", name: "motion" },
        {
          k: "points",
          items: [
            { t: "길이", d: "작은 변화(버튼, 토글)는 0.1~0.2초, 패널·시트는 0.25~0.4초, 화면 전환은 0.45~0.6초. Material 3의 duration 값이에요." },
            { t: "곡선", d: "들어오는 건 빠르게 시작해서 천천히 멈추게(감속). 일정한 속도(linear)는 기계처럼 보여요. Material 3 감속 곡선: `cubic-bezier(0.05, 0.7, 0.1, 1)`" },
            { t: "움직일 속성", d: "`transform` 과 `opacity` 만 움직여요. width, top 같은 걸 움직이면 화면이 버벅여요." },
            { t: "동작 줄이기 설정", d: "`prefers-reduced-motion` 이 켜진 사람에게는 움직임을 끄거나 줄여요." },
          ],
        },
        {
          k: "code",
          label: "globals.css",
          both: `.sheet { transition: transform 0.4s cubic-bezier(0.05, 0.7, 0.1, 1), opacity 0.2s; }
.btn { transition: transform 0.15s; }
.btn:active { transform: scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}`,
        },
      ],
    },
    {
      title: "색과 대비",
      blocks: [
        {
          k: "points",
          items: [
            { t: "대비 4.5 : 1", d: "본문 글자와 배경의 최소 대비예요(WCAG AA). 큰 글씨와 버튼 테두리 같은 UI는 3 : 1." },
            { t: "색은 토큰으로", d: "`--text`, `--muted`, `--surface` 처럼 이름을 붙여 한 곳에서 정해요. 코드에 #색상값을 흩뿌리지 않아요." },
            { t: "다크 모드를 넣으면 둘 다 확인", d: "토큰마다 라이트·다크 값을 같이 정하고, 두 모드에서 직접 눌러 봐요." },
          ],
        },
      ],
    },
    {
      title: "AI에게 이렇게 시켜요",
      blocks: [
        { k: "prompt", t: "docs/DESIGN.md 에 아래 규칙을 추가하고 globals.css 토큰으로 반영해 줘. 글꼴 Pretendard(next/font/local), 본문 자간 0, 줄 간격 1.6, 제목 자간 -0.02em, word-break: keep-all. radius 토큰 28/20/14px, 안쪽 radius = 바깥 - 여백. 간격은 4의 배수. 모션은 transform·opacity만, 0.15~0.4초, 감속 곡선, prefers-reduced-motion 대응. 바꾼 다음 화면을 열어서 스크린샷으로 보여 줘." },
        { k: "go", to: "refs", t: "색·분위기를 가져올 레퍼런스는 디자인 레퍼런스에" },
      ],
    },
  ],
};

export const DOCS: Doc[] = [ai, arch, env, install, mcp, figma, deploy, design, direct, moneyPrd, compete, firstSteps];
// 소모임(NE:부자들) 전용 자료. 주소는 있지만 자료실 목록과 "자료 전체 복사"에는 넣지 않고, 소모임 화면에서만 보여 준다
export const CLUB_DOCS: Doc[] = [moneyPrd, compete, firstSteps];
export const LIBRARY_DOCS: Doc[] = DOCS.filter((d) => !CLUB_DOCS.includes(d));
export const DOC_MAP: Record<string, Doc> = Object.fromEntries(DOCS.map((d) => [d.id, d]));

// 자료실 첫 화면 묶음. guide·refs 는 따로 만든 페이지라 설명만 여기 둔다
export const LIBRARY: { title: string; items: { id: string; label: string; desc: string }[] }[] = [
  {
    title: "이해하기",
    items: [
      { id: "ai", label: ai.label, desc: ai.desc },
      { id: "arch", label: arch.label, desc: arch.desc },
    ],
  },
  {
    title: "세팅하기",
    items: [
      { id: "env", label: env.label, desc: env.desc },
      { id: install.id, label: install.label, desc: install.desc },
      { id: "mcp", label: mcp.label, desc: mcp.desc },
      { id: figma.id, label: figma.label, desc: figma.desc },
      { id: "deploy", label: deploy.label, desc: deploy.desc },
    ],
  },
  {
    title: "잘 만들기",
    items: [
      { id: direct.id, label: direct.label, desc: direct.desc },
      { id: "guide", label: "바이브 코딩 가이드", desc: "AI와 일 나누기, 개입할 때, 프롬프트, PRD, 해커톤 체크리스트" },
      { id: "refs", label: "디자인 레퍼런스", desc: "DESIGN.md, 컴포넌트, 레퍼런스 갤러리 링크와 실제 화면" },
      { id: "design", label: design.label, desc: design.desc },
    ],
  },
];
