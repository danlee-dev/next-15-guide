# 바이브 코딩 툴킷 레퍼런스 (리서치 원본)

- 기준일: 2026-10-10. 아래 명령어·버전·가격은 모두 이 날짜에 공식 문서나 공식 GitHub README에서 직접 확인했어요.
- 대상: Claude Code 또는 Codex 구독이 있고, Next.js + Supabase + OpenAI API + Vercel을 조금 써 본 대학생. 10/31 해커톤 준비용, 이후 사이드 프로젝트까지.
- 스크린샷: `public/refs/<slug>.webp` (1280x800, 라이트 모드). 로고: `public/refs/logos/<slug>.png|svg`.
- 이 문서는 사이트 페이지로 옮기기 전의 원본이에요. 항목마다 같은 순서(한 줄 설명 / 언제 쓰나 / 링크 / 설치 / 사용 예시 / 주의 / 스크린샷 / 로고 / 출처)로 정리했어요.

## 0. 먼저 결론: 무엇부터 깔까

해커톤 전에 꼭 할 것 (순서대로)

1. Node.js 24 LTS, Git, GitHub CLI(`gh`)
2. Claude Code 또는 Codex CLI 하나 (둘 다 있어도 됨)
3. 브라우저를 AI에게 보여 주는 MCP 하나: Playwright MCP 또는 Chrome DevTools MCP
4. Next.js 16 프로젝트라면 Next.js MCP(`next-devtools-mcp`)
5. Context7 (Supabase, shadcn 등 다른 라이브러리 최신 문서용)
6. Vercel CLI, Supabase CLI(`npx supabase`)

필요해지면 추가할 것

- Supabase MCP (읽기 전용 + 프로젝트 하나로 제한해서)
- Vercel MCP (배포 로그를 AI가 직접 읽게 할 때)
- Railway MCP (백엔드를 Railway에 올렸을 때)
- Figma MCP (디자이너가 Figma로 시안을 줄 때)

일부러 뺀 것은 문서 맨 끝 "제외한 도구"에 이유와 함께 적어 뒀어요.

---

## 1. AI 코딩 에이전트

### 1.1 Claude Code

- 한 줄 설명: 터미널에서 돌아가는 Anthropic의 코딩 에이전트예요. 코드베이스를 읽고, 파일을 고치고, 명령어를 실행하고, 결과를 보고 다시 고쳐요.
- 언제 쓰나: "로그인 페이지 만들어줘", "이 에러 고쳐줘"처럼 여러 파일에 걸친 작업을 맡길 때. 터미널이 낯설면 같은 기능의 데스크톱 앱(Claude Code Desktop)도 있어요.
- 링크: https://code.claude.com/docs/en/overview , 설치 상세 https://code.claude.com/docs/en/setup , 모범 사례 https://code.claude.com/docs/en/best-practices
- 필요한 것: Claude Pro, Max, Team, Enterprise 또는 Console(API) 계정. 무료 claude.ai 플랜에는 Claude Code가 포함되지 않아요. macOS 13+, Windows 10 1809+.

설치 (macOS)

```bash
# 공식 권장: 네이티브 설치 (자동 업데이트됨)
curl -fsSL https://claude.ai/install.sh | bash

# 또는 Homebrew (자동 업데이트 안 됨. stable 채널이라 최신보다 약 1주 늦음)
brew install --cask claude-code
brew upgrade claude-code   # 업데이트할 때
```

설치 (Windows, PowerShell)

```powershell
# 공식 권장: 네이티브 설치
irm https://claude.ai/install.ps1 | iex

# 또는 WinGet (자동 업데이트 안 됨)
winget install Anthropic.ClaudeCode
winget upgrade Anthropic.ClaudeCode   # 업데이트할 때
```

CMD를 쓰면 `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` 를 실행해요. 프롬프트가 `PS C:\`로 시작하면 PowerShell, `C:\`면 CMD예요.

Windows에서는 Git for Windows를 같이 설치하는 걸 권장해요(1.5, 4.3 참고). 있으면 Claude Code가 Git Bash로 명령을 실행하고, 없으면 PowerShell로 실행해요.

설치 확인과 첫 실행

```bash
claude --version   # 예: 2.1.xxx (Claude Code)
claude doctor      # 설치 상태 점검 (세션을 시작하지 않음)

cd my-app
claude             # 처음 실행하면 브라우저가 열리고 로그인
```

처음 세팅할 때 알아 둘 기능

- `/init`: 프로젝트를 훑어보고 `CLAUDE.md`(프로젝트 설명서)를 만들어 줘요. 이미 있으면 덮어쓰지 않고 개선안을 제안해요.
- 플랜 모드: 코드를 고치기 전에 계획만 세우게 하는 모드예요. `Shift+Tab`을 눌러 상태줄에 `plan mode on`이 보일 때까지 돌리거나, 프롬프트 앞에 `/plan`을 붙여요. 처음부터 켜려면 `claude --permission-mode plan`. 계획이 나오면 `Ctrl+G`로 에디터에서 직접 고칠 수 있어요.
- 권한 모드: `Shift+Tab`으로 순환해요.
  - `default`(화면 표시는 Manual): 파일 수정·명령 실행마다 물어봐요. 처음 배울 때 추천.
  - `acceptEdits`: 파일 수정은 자동 승인, 나머지는 물어봐요.
  - `plan`: 읽기만 하고 계획을 세워요.
  - `auto`: 별도 분류 모델이 위험한 행동만 막고 나머지는 알아서 진행해요. v2.1.283부터 새 세션의 기본값이 auto예요.
  - `bypassPermissions`(`--dangerously-skip-permissions`): 아무것도 안 물어봐요. 컨테이너나 VM 안에서만 쓰라고 문서에 적혀 있어요.
  - 매번 직접 확인하고 싶으면 `claude --permission-mode manual`로 시작하면 돼요.
- 자주 쓰는 슬래시 명령어

| 명령어 | 하는 일 |
| --- | --- |
| `/init` | CLAUDE.md 생성 |
| `/clear` | 대화를 비우고 새로 시작 (다른 작업으로 넘어갈 때) |
| `/compact` | 지금까지 대화를 요약해 컨텍스트 확보 |
| `/rewind` (또는 `Esc` 두 번) | 이전 시점으로 대화·코드 되돌리기 |
| `/model` | 모델 변경 |
| `/mcp` | MCP 서버 연결 상태 확인, OAuth 로그인 |
| `/permissions` | 허용·차단 규칙 관리 |
| `/context` | 컨텍스트를 얼마나 쓰고 있는지 확인 |
| `/usage` | 사용량·요금제 한도 확인 (`/cost`도 같음) |
| `/resume` | 지난 대화 이어서 하기 |
| `/review` | 현재 변경사항 코드 리뷰 (`/code-review`의 별칭) |
| `/security-review` | 현재 브랜치 변경분 보안 점검 |
| `/doctor` | 설치·설정·CLAUDE.md 문제 점검 |
| `/btw` | 대화 기록에 안 남기고 곁가지 질문 |

- 스킬(Skills): 반복하는 작업 절차를 파일로 저장해 두는 기능이에요. `.claude/skills/<이름>/SKILL.md`(프로젝트용) 또는 `~/.claude/skills/<이름>/SKILL.md`(내 모든 프로젝트용)에 두면 `/이름`으로 부르거나 Claude가 상황에 맞으면 알아서 써요. 예전의 `.claude/commands/*.md` 커스텀 명령어는 스킬로 합쳐졌고 그대로 동작해요.
- 서브에이전트(Subagents): 별도 컨텍스트에서 일하고 요약만 돌려주는 보조 에이전트예요. 기본으로 Explore(읽기 전용 탐색), Plan, general-purpose가 있어요. 직접 만들려면 `.claude/agents/<이름>.md`. 프롬프트에 "use subagents to investigate ..."라고 쓰면 메인 대화가 덜 지저분해져요.

사용 예시

```text
/plan 로그인 안 한 사용자가 /dashboard에 들어오면 /login으로 보내는 기능을 넣고 싶어. 어떤 파일을 바꿔야 하는지 계획부터 세워줘.
```

```text
npm run build가 이 에러로 실패해: [에러 붙여넣기]. 원인을 고치고 build가 통과하는 것까지 확인해줘. 에러를 숨기지 말고 근본 원인을 고쳐.
```

주의

- 무료 플랜으로는 못 써요. Pro 이상 또는 API 키(사용량 과금)가 필요해요.
- `sudo npm install -g`로 설치하지 마세요(공식 문서 경고). npm으로 설치하려면 Node.js 22 이상이 필요하고, 네이티브 설치는 Node가 없어도 돼요.
- 체크포인트(`/rewind`)는 Claude의 파일 편집 도구로 바꾼 것만 되돌려요. 명령어로 바뀐 파일은 못 되돌리니 git 커밋을 따로 해 두세요.
- 네이티브 Windows에서는 샌드박스 기능이 지원되지 않아요(WSL2는 지원).
- Claude가 맞는지 확인할 수단(테스트, 빌드, 스크린샷)을 같이 주라는 게 공식 모범 사례의 첫 번째 항목이에요.

- 스크린샷: public/refs/claude-code.webp (공식 문서 Overview의 Get started 섹션)
- 로고: public/refs/logos/claude-code.png
- 확인한 출처: code.claude.com/docs/en/setup, /permission-modes, /memory, /commands, /skills, /sub-agents, /best-practices (2026-10-10). npm 최신 버전 2.1.296 확인(2026-10-10).

### 1.2 OpenAI Codex CLI

- 한 줄 설명: OpenAI의 터미널 코딩 에이전트예요. ChatGPT 계정으로 로그인해서 쓰고, 기본적으로 샌드박스 안에서 명령을 실행해요.
- 언제 쓰나: ChatGPT Plus 이상 구독이 있을 때. Claude Code와 같은 용도로 쓰면 되고, 둘 다 있으면 한쪽이 짠 코드를 다른 쪽이 리뷰하게 해도 좋아요.
- 링크: https://learn.chatgpt.com/docs/codex/cli (예전 주소 developers.openai.com/codex 는 이 주소로 영구 이동됨), GitHub https://github.com/openai/codex
- 필요한 것: ChatGPT Plus, Pro, Business, Edu, Enterprise 플랜(CLI 포함) 또는 API 키. 요금표에 Free·Go 플랜은 CLI 포함으로 표시되지 않아요.

설치 (macOS)

```bash
# 공식 설치 스크립트 (설치와 업데이트 같은 명령)
curl -fsSL https://chatgpt.com/codex/install.sh | sh

# 또는 Homebrew
brew install --cask codex
brew upgrade --cask codex   # 업데이트

# 또는 npm
npm install -g @openai/codex
```

설치 (Windows, 새 PowerShell 창)

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"

# 또는 npm
npm install -g @openai/codex
```

Windows는 네이티브(PowerShell)로 돌아가요. 리눅스 도구가 꼭 필요할 때만 WSL2를 쓰라고 문서에 적혀 있어요(WSL1은 지원 종료).

첫 실행

```bash
cd my-app
codex          # "Sign in with ChatGPT" 선택 → 브라우저 로그인
```

처음 세팅할 때 알아 둘 기능

- `/init`: `AGENTS.md`(Codex용 프로젝트 설명서) 뼈대를 만들어 줘요.
- 권한(승인·샌드박스): 세션 안에서 `/permissions`로 바꿔요. 문서는 대부분의 작업에 "Ask for approval"을 권장해요. "Approve for me"는 자동 검토, "Full access"는 제한 없음이에요.
  - git 저장소 폴더의 기본값: `workspace-write` 샌드박스 + `on-request` 승인. 현재 폴더 안에서는 읽고 쓰고 실행하되, 폴더 밖 쓰기나 네트워크 사용은 물어봐요.
  - git이 아닌 폴더는 `read-only`로 시작해요. 네트워크는 기본으로 꺼져 있어요.
  - 명령줄 옵션: `--sandbox read-only|workspace-write|danger-full-access`, `--ask-for-approval on-request|never`(`-a`). `--yolo`(`--dangerously-bypass-approvals-and-sandbox`)는 샌드박스와 승인을 둘 다 꺼서 권장하지 않아요. 예전의 `untrusted` 승인 정책은 폐지됐고 설정에 남아 있으면 실행이 안 될 수 있어요.
- 자주 쓰는 슬래시 명령어: `/init`, `/status`(모델·권한·토큰 사용량), `/permissions`, `/model`, `/review`(작업 트리 리뷰), `/diff`(git diff), `/mcp`, `/compact`, `/new`(새 대화), `/skills`. 입력창이 빈 상태에서 `Esc`를 두 번 누르면 이전 메시지를 고쳐서 거기서부터 다시 갈 수 있어요.
- 스킬: `.agents/skills/`(저장소) 또는 `~/.agents/skills/`(내 계정)에 둬요. `/skills` 또는 `$이름`으로 불러요.
- 설정 파일: `~/.codex/config.toml` (Windows는 `C:\Users\<이름>\.codex\config.toml`). MCP 서버도 여기에 등록돼요.

사용 예시

```text
이 프로젝트 구조를 설명해줘. 아직 아무것도 고치지 마.
```

```text
/review
```

주의

- 기본 샌드박스는 네트워크가 꺼져 있어서 `npm install` 같은 명령에서 승인 요청이 떠요. 무엇을 받는지 보고 승인하세요.
- Plus 플랜은 5시간 단위 사용 한도가 있어요(모델별로 다름). `/status`로 확인해요.
- 문서가 작업 전후로 git 커밋(체크포인트)을 남기라고 권장해요.

- 스크린샷: public/refs/codex-cli.webp (Codex CLI 공식 문서 첫 화면)
- 로고: public/refs/logos/codex-cli.svg (learn.chatgpt.com이 제공하는 favicon.svg)
- 확인한 출처: learn.chatgpt.com/docs/codex/cli, /agent-approvals-security, /permission-modes, /agent-configuration/agents-md, /developer-commands, /build-skills, /windows/windows-sandbox, /windows/wsl, /pricing, github.com/openai/codex README (2026-10-10). npm 최신 0.162.1 확인.

### 1.3 AGENTS.md / CLAUDE.md (에이전트용 프로젝트 설명서)

- 한 줄 설명: 에이전트가 세션을 시작할 때마다 읽는 마크다운 파일이에요. "빌드는 `npm run build`", "색은 globals.css 토큰만 써" 같은 규칙을 적어 둬요.
- 언제 쓰나: 프로젝트를 시작하자마자. 같은 설명을 매번 반복하고 있다면 여기에 적을 때예요.
- 링크: https://agents.md (형식 소개), Claude Code 쪽 https://code.claude.com/docs/en/memory , Codex 쪽 https://learn.chatgpt.com/docs/agent-configuration/agents-md

어떻게 나눠 쓰나

- Codex는 `AGENTS.md`를 읽어요. 전역 `~/.codex/AGENTS.md` → 저장소 루트 → 현재 폴더 순서로 이어 붙이고, 합쳐서 기본 32KiB까지만 읽어요.
- Claude Code는 `CLAUDE.md`를 읽어요. 위치는 `./CLAUDE.md` 또는 `./.claude/CLAUDE.md`(팀 공유), `~/.claude/CLAUDE.md`(나만), `./CLAUDE.local.md`(나만, gitignore). v2.1.277부터는 `CLAUDE.md`가 없으면 `AGENTS.md`를 대신 읽어요.
- 두 도구를 같이 쓰는 팀이라면: 규칙은 `AGENTS.md` 하나에 쓰고, `CLAUDE.md`가 따로 필요하면 첫 줄에 `@AGENTS.md`를 적어서 가져오게 해요. 그러면 한 곳만 고치면 돼요.
- Next.js 16.3 이상은 `create-next-app`이 `AGENTS.md`를 만들고, `<!-- BEGIN:nextjs-agent-rules -->` 블록에 "node_modules/next/dist/docs/의 문서를 먼저 읽어라"를 넣어요. `next dev`가 이 블록을 계속 다시 써 넣으니 지우지 말고 그대로 커밋하세요.

설치 / 세팅 (macOS, Windows 동일)

```bash
# Claude Code 안에서
/init

# Codex 안에서
/init
```

해커톤용 최소 예시

```markdown
# AGENTS.md
## 명령어
- 개발 서버: `npm run dev`
- 빌드 확인: `npm run build` (커밋 전에 꼭)
## 규칙
- API 키는 `.env.local`에만. 코드에 직접 쓰지 않기
- Supabase 테이블을 만들면 RLS 정책도 같이 만들기
- UI를 바꾸면 브라우저로 직접 열어서 확인하고 결과를 알려주기
```

사용 예시

```text
지금까지 내가 두 번 이상 정정한 내용을 AGENTS.md 규칙으로 정리해서 추가해줘.
```

주의

- 길면 안 지켜요. Claude Code 문서는 파일당 200줄 이하를 권하고, "이 줄을 지우면 실수할까?"를 기준으로 줄이라고 해요.
- `CLAUDE.local.md`가 하나라도 있으면 Claude Code는 `AGENTS.md`를 읽지 않아요(기본 설정 기준). 둘 다 읽게 하려면 `/config`에서 Project instructions를 `claude-md-and-agents-md`로 바꿔요.
- API 키나 비밀번호는 절대 적지 마세요. 이 파일은 보통 git에 올라가요.

- 스크린샷: public/refs/agents-md.webp (agents.md 메인)
- 로고: public/refs/logos/agents-md.png
- 확인한 출처: agents.md, code.claude.com/docs/en/memory, learn.chatgpt.com/docs/agent-configuration/agents-md, nextjs.org/docs/app/guides/ai-agents (2026-10-10)

### 1.4 Cursor (간단히)

- 한 줄 설명: VS Code 기반의 AI 코드 에디터예요. 에디터 안에서 에이전트를 돌리고 diff를 눈으로 보며 승인할 수 있어요.
- 언제 쓰나: 터미널보다 에디터 화면에서 바뀐 코드를 보며 작업하고 싶을 때. 이미 Claude Code나 Codex 구독이 있으면 필수는 아니에요. 에디터로 VS Code를 쓰고 그 안의 터미널에서 Claude Code/Codex를 돌려도 충분해요.
- 링크: https://cursor.com , 요금 https://cursor.com/pricing
- 설치: cursor.com에서 설치 파일을 받아요 (macOS, Windows 모두).
- 사용 예시: 프로젝트 폴더를 열고 에이전트 패널에 작업을 적어요.
- 주의: 무료(Hobby)는 에이전트 요청 수가 제한돼 있고, 개인 유료 플랜은 월 20달러부터예요. Claude/Codex 구독과 별개로 결제돼요.
- 스크린샷: 없음
- 로고: public/refs/logos/cursor.png
- 확인한 출처: cursor.com, cursor.com/pricing (2026-10-10)

---

## 2. MCP 서버

### 2.0 MCP가 뭔지, 공통 명령어

MCP(Model Context Protocol)는 AI 에이전트가 외부 서비스(데이터베이스, 배포 플랫폼, 브라우저, 문서)를 직접 조회하고 조작하게 해 주는 표준 연결 규격이에요. 휴대폰 충전 단자가 USB-C 하나로 통일된 것처럼, 서비스마다 다른 API를 에이전트 쪽에서는 같은 방식으로 꽂아 쓰게 해 줘요.

Claude Code 공통

```bash
# 원격(HTTP) 서버
claude mcp add --transport http <이름> <URL>

# 내 컴퓨터에서 실행하는(stdio) 서버: -- 뒤가 실행할 명령
claude mcp add <이름> -- npx -y <패키지>

# 범위: local(기본, 이 프로젝트·나만) / project(.mcp.json에 저장, git으로 팀 공유) / user(내 모든 프로젝트)
claude mcp add --scope user ...

claude mcp list            # 상태 확인 (Connected / Needs authentication / Failed)
claude mcp remove <이름>
claude mcp login <이름>    # OAuth 로그인. 세션 안에서는 /mcp → 서버 선택 → Authenticate
```

Codex 공통

```bash
codex mcp add <이름> -- <실행 명령>          # stdio 서버
codex mcp add <이름> --url <URL>            # 원격(HTTP) 서버
codex mcp login <이름>                      # OAuth 로그인
codex mcp list
```

Codex는 `~/.codex/config.toml`에 이렇게 저장돼요. 직접 고쳐도 돼요.

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.vercel]
url = "https://mcp.vercel.com"
```

공통 주의

- 연결한 MCP는 내 계정 권한으로 움직여요. 공식 주소인지 꼭 확인하고, 처음에는 읽기 전용·프로젝트 하나로 좁혀서 연결하세요.
- 토큰이나 API 키가 들어간 설정을 `--scope project`(`.mcp.json`)로 저장하면 git에 올라가요. 키가 필요한 서버는 local 또는 user 범위로 저장하세요.
- 도구 목록도 컨텍스트(토큰)를 먹어요. Claude Code는 기본으로 tool search를 켜 둬서 처음에는 도구 이름만 올리고 필요할 때 정의를 불러와요. Codex는 서버별로 `enabled_tools` / `disabled_tools`로 도구를 줄일 수 있어요. 안 쓰는 서버는 지우는 게 제일 확실해요.
- 외부 내용을 가져오는 서버(웹페이지, 로그, DB 데이터)는 그 안에 숨은 지시문으로 에이전트를 속이는 프롬프트 인젝션 위험이 있어요. 쓰기 작업 승인은 직접 읽고 누르세요.
- 확인한 출처: code.claude.com/docs/en/mcp, learn.chatgpt.com/docs/extend/mcp (2026-10-10)

### 2.1 Context7 (라이브러리 최신 문서)

- 한 줄 설명: Supabase, shadcn/ui, Tailwind 같은 라이브러리의 최신 문서와 예제 코드를 에이전트에게 넣어 줘요. 모델이 학습한 옛날 API를 쓰는 실수를 줄여요.
- 언제 쓰나: "이 함수 없다는데요" 같은 에러가 날 때, 버전이 자주 바뀌는 라이브러리를 쓸 때. Next.js 16.2 이상은 문서가 `node_modules/next/dist/docs/`에 같이 들어 있어서 Next.js 자체는 Context7 없이도 돼요(2.2 참고). 그 외 라이브러리에 써요.
- 링크: https://context7.com , GitHub https://github.com/upstash/context7 , 클라이언트별 설정 https://context7.com/docs/resources/all-clients

설치 (macOS, Windows 동일)

```bash
# 가장 쉬운 방법: OAuth 로그인, API 키 생성, 스킬 설치를 한 번에 (Claude Code 대상)
npx ctx7 setup --claude

# Claude Code 수동: 키 없이도 동작 (한도가 낮음)
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp

# Claude Code 수동: 무료 API 키를 받은 경우 (context7.com/dashboard)
claude mcp add --scope user --header "Authorization: Bearer <내_API_키>" --transport http context7 https://mcp.context7.com/mcp

# Codex: 로컬 실행 (Codex 공식 문서 예시)
codex mcp add context7 -- npx -y @upstash/context7-mcp

# Codex: 원격 + 키는 환경 변수에서 읽기 (키를 설정 파일에 안 남김)
codex mcp add context7 --url https://mcp.context7.com/mcp --bearer-token-env-var CONTEXT7_API_KEY
```

사용 예시

```text
Supabase에서 Next.js App Router용 서버 클라이언트 만드는 최신 방법으로 lib/supabase/server.ts 작성해줘. use context7
```

```text
shadcn/ui의 Sidebar 컴포넌트 사용법 확인해서 대시보드 레이아웃 만들어줘. use library /shadcn-ui/ui
```

주의

- 무료 플랜은 월 1,000회 호출이에요. 다 쓰면 막히고 하루 20회 보너스만 줘요. Pro는 좌석당 월 10달러(2,000회 포함).
- 프롬프트 끝에 "use context7"을 붙이거나 CLAUDE.md/AGENTS.md에 "라이브러리 API를 쓸 땐 Context7로 확인"이라고 적어 두면 잘 불러요.
- API 키를 `--scope project`로 저장하지 마세요.
- 스크린샷: public/refs/context7.webp (메인, `npx ctx7 setup` 보임)
- 로고: public/refs/logos/context7.png
- 확인한 출처: github.com/upstash/context7 README, context7.com/docs/resources/all-clients, context7.com/plans, learn.chatgpt.com/docs/extend/mcp (2026-10-10)

### 2.2 Next.js MCP (`next-devtools-mcp`)

- 한 줄 설명: 실행 중인 `next dev` 서버에 에이전트를 연결해서, 지금 화면에 떠 있는 에러·라우트 목록·서버 로그·컴파일 문제를 에이전트가 직접 읽게 해요.
- 언제 쓰나: Next.js 16 이상 프로젝트에서 "화면에 빨간 에러 떴어"를 일일이 복사해 붙이고 있을 때.
- 링크: https://nextjs.org/docs/app/guides/mcp , https://github.com/vercel/next-devtools-mcp
- 필요한 것: Next.js 16+, Node.js 20.19 이상, 실행 중인 dev 서버.

설치

```bash
# Claude Code (macOS, Windows)
claude mcp add next-devtools npx next-devtools-mcp@latest

# Codex (macOS)
codex mcp add next-devtools -- npx next-devtools-mcp@latest
```

Codex on Windows 11은 README 안내대로 `config.toml`에 환경 변수와 시작 대기 시간을 추가해요.

```toml
[mcp_servers.next-devtools]
command = "npx"
args = ["next-devtools-mcp@latest"]
env = { SystemRoot = "C:\\Windows", PROGRAMFILES = "C:\\Program Files" }
startup_timeout_ms = 20_000
```

사용 예시

```text
지금 내 앱에 어떤 에러가 떠 있는지 확인하고 고쳐줘.
```

```text
이 프로젝트의 라우트 목록 보여주고, /dashboard 라우트가 컴파일되는지 확인해줘.
```

주의

- `npm run dev`를 먼저 켜 두고, 작업 중인 페이지를 브라우저에 열어 둬야 브라우저 쪽 에러까지 읽어요.
- 이 엔드포인트(`/_next/mcp`)는 개발 서버에만 있어요. `next.config`에서 `experimental.mcpServer: false`로 끌 수 있어요.
- 스크린샷: 없음
- 로고: public/refs/logos/nextjs-mcp.png (vercel/next.js 공식 README가 쓰는 아이콘)
- 확인한 출처: nextjs.org/docs/app/guides/mcp, nextjs.org/docs/app/guides/ai-agents, github.com/vercel/next-devtools-mcp (2026-10-10)

### 2.3 Playwright MCP (AI에게 브라우저 쥐여 주기)

- 한 줄 설명: 에이전트가 브라우저를 직접 열어 클릭·입력·스크린샷을 하며 결과를 확인하게 해요. 매번 깨끗한 브라우저로 열 수 있어요.
- 언제 쓰나: "회원가입 폼 고쳤으니 실제로 눌러서 에러 메시지 뜨는지 확인해줘"처럼 화면 동작을 검증할 때. Claude Code와 Codex 둘 다에서 같은 방식으로 쓸 수 있어요.
- 링크: https://github.com/microsoft/playwright-mcp
- 필요한 것: Node.js 18+

설치 (macOS, Windows 동일)

```bash
# Claude Code (README 명령. 모든 프로젝트에서 쓰려면 --scope user 추가)
claude mcp add playwright npx @playwright/mcp@latest

# Codex (Codex 공식 문법)
codex mcp add playwright -- npx @playwright/mcp@latest
```

Codex 설정 파일로 넣을 때

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

주요 옵션: `--headless`(창 없이 실행, 기본은 창이 보임), `--isolated`(브라우저 프로필을 디스크에 저장 안 함), `--browser chrome|firefox|webkit|msedge`.

사용 예시

```text
localhost:3000/signup 열어서 이메일 칸을 비우고 가입 버튼 눌러봐. 에러 메시지가 보이는지 스크린샷으로 확인하고, 375px 모바일 폭에서도 확인해줘.
```

주의

- README는 코딩 에이전트라면 MCP 대신 Playwright CLI + 스킬이 토큰을 덜 쓴다고 안내해요. 설치는 `npm install -g @playwright/cli@latest` 후 `playwright-cli install --skills`. 오래 상태를 유지하며 탐색하는 작업에는 MCP가 더 낫다고 해요.
- 접근성 트리를 통째로 읽어서 페이지가 크면 토큰을 많이 써요.
- 스크린샷: public/refs/playwright-mcp.webp (README Getting started)
- 로고: public/refs/logos/playwright-mcp.svg (playwright.dev 로고)
- 확인한 출처: github.com/microsoft/playwright-mcp README, github.com/microsoft/playwright-cli README (2026-10-10). npm @playwright/mcp 0.0.83.

### 2.4 Chrome DevTools MCP (콘솔·네트워크·성능까지)

- 한 줄 설명: Chrome 개발자 도구를 에이전트에게 열어 줘요. 콘솔 에러(소스맵 적용된 스택), 네트워크 요청, 성능 트레이스, 스크린샷을 에이전트가 직접 봐요.
- 언제 쓰나: "API 호출이 401이 나는데 왜인지 모르겠다", "페이지가 느리다"처럼 콘솔·네트워크를 봐야 할 때. Playwright MCP보다 디버깅 쪽에 강해요. 둘 중 하나만 깔아도 돼요.
- 링크: https://github.com/ChromeDevTools/chrome-devtools-mcp , 클라이언트별 설정 https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md
- 필요한 것: Node.js LTS, Chrome 최신 안정 버전

설치

```bash
# Claude Code (macOS, Windows)
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest

# Claude Code 플러그인 방식 (MCP + 스킬)
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp@chrome-devtools-plugins

# Codex (macOS)
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

Codex on Windows 11 (`.codex/config.toml`)

```toml
[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
env = { SystemRoot="C:\\Windows", PROGRAMFILES="C:\\Program Files" }
startup_timeout_ms = 20_000
```

가벼운 작업만 할 거면 `--slim --headless` 옵션을 붙여요.

사용 예시

```text
localhost:3000/dashboard 열고 콘솔 에러랑 실패한 네트워크 요청 찾아줘. 원인 코드를 고친 다음 다시 열어서 에러가 없어졌는지 확인해.
```

주의

- 공식 README 경고: 브라우저에 보이는 내용이 MCP 클라이언트(에이전트)에게 그대로 넘어가요. 개인 정보가 보이는 탭에서 쓰지 마세요.
- 기본으로 사용 통계를 보내요. 끄려면 `--no-usage-statistics`.

참고: Claude Code 전용 대안 "Claude in Chrome"

- Claude Code + Chrome 확장 프로그램 조합이에요. `claude --chrome`으로 시작하고 `/chrome`으로 상태를 봐요. Pro 이상 직접 구독 필요, WSL에서는 안 돼요.
- 내가 이미 로그인한 브라우저 상태를 그대로 써서 편하지만, 그만큼 내 계정들(메일, 노션 등)에 에이전트가 닿을 수 있어요. 로컬 개발 서버 확인용으로만 쓰는 걸 권해요.
- 출처: code.claude.com/docs/en/chrome (2026-10-10)

- 스크린샷: public/refs/chrome-devtools-mcp.webp (README Getting started)
- 로고: public/refs/logos/chrome-devtools-mcp.png (developer.chrome.com 아이콘)
- 확인한 출처: github.com/ChromeDevTools/chrome-devtools-mcp README와 docs/client-configurations.md (2026-10-10). npm 1.10.1.

### 2.5 배포·백엔드 MCP 3종: Supabase / Vercel / Railway

세 서비스 모두 "대시보드에 들어가서 보고, 복사해서, 에이전트에게 붙여 넣던 일"을 에이전트가 직접 하게 만들어요. 대신 내 계정 권한으로 움직이니까 범위를 좁혀서 연결하는 게 핵심이에요.

#### 2.5.1 Supabase MCP

1) MCP를 한 문장으로: 에이전트에게 내 Supabase 프로젝트의 열쇠를 빌려주는 연결 규격이에요. 열쇠를 "이 방 하나, 보기만"으로 깎아서 줄 수 있어요.

2) 연결하면 뭐가 쉬워지나

| 전 | 후 |
| --- | --- |
| 대시보드 Table Editor에서 컬럼을 보고 에이전트에게 타이핑해 줌 | "profiles 테이블 구조 보고 타입 맞춰서 폼 만들어줘" |
| RLS 정책 확인하려고 화면 여러 개 이동 | "todos 테이블 RLS 정책 보여주고 빠진 거 알려줘" |
| 로그 화면에서 에러 찾아 복사 | "최근 API 로그에서 에러 찾아서 원인 설명해줘" |

3) 연결 명령 (macOS, Windows PowerShell 모두 같음. URL에 `&`가 있어서 따옴표 필수)

프로젝트 ref는 대시보드 주소 `supabase.com/dashboard/project/<ref>`의 `<ref>` 부분이에요.

```bash
# Claude Code: 프로젝트 하나 + 읽기 전용으로 추가
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"

# 로그인: 일반 터미널(IDE 확장 아님)에서
claude /mcp
# → supabase 선택 → Authenticate → 브라우저에서 승인
```

```bash
# Codex
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true"
codex mcp login supabase
# Codex 안에서 /mcp 로 연결 확인
```

범위 좁히는 옵션 (URL 쿼리)

- `project_ref=<ref>`: 이 프로젝트만. 없으면 내 계정의 모든 프로젝트에 닿아요.
- `read_only=true`: 읽기 전용 Postgres 사용자로 SQL 실행.
- `features=database,docs`: 필요한 도구 그룹만 켜기. 도구 수가 줄어서 토큰도 덜 써요. 그룹: database, debugging, development, functions(Edge Functions), account, docs, branching, storage(기본 꺼짐).

4) 예시 프롬프트

```text
Supabase에 있는 테이블 목록이랑 각 테이블의 RLS 정책 요약해줘. 고치지는 마.
```

```text
posts 테이블 스키마 보고 lib/database.types.ts 타입이랑 안 맞는 부분 찾아줘.
```

```text
Supabase 보안 advisor 결과 확인해서 위험한 것부터 정리해줘.
```

5) 위험

- 내 개발자 권한으로 실행돼요. 공식 문서는 고객·일반 사용자에게 이 서버를 주지 말라고 해요.
- 운영(프로덕션) 데이터: 문서는 "운영 증거가 꼭 필요할 때만" 연결하라고 해요. 해커톤에서는 개발용 프로젝트에만 연결하세요.
- 쓰기를 허용하면 `execute_sql`, `apply_migration`으로 테이블을 바꿀 수 있어요. 스키마 변경은 마이그레이션 파일(4.5 Supabase CLI)로 하는 습관이 안전해요.
- 테이블 안의 사용자 입력(게시글, 문의 내용)에 숨은 지시문이 에이전트를 속일 수 있어요(프롬프트 인젝션). 도구 호출 승인은 직접 읽고 눌러요.
- 토큰: 기본으로 켜진 그룹이 많아요. `features`로 줄이세요.

- 스크린샷: public/refs/supabase-mcp.webp (공식 MCP 문서. Read-only 토글과 Feature Groups 선택 화면)
- 로고: public/refs/logos/supabase-mcp.png
- 확인한 출처: supabase.com/docs/guides/ai-tools/mcp (예전 주소 /guides/getting-started/mcp 에서 이동) (2026-10-10)

#### 2.5.2 Vercel MCP

1) MCP를 한 문장으로: 에이전트가 Vercel 대시보드를 대신 열어 보고 조작할 수 있게 해 주는 연결이에요. 공식 원격 서버라 내 컴퓨터에 설치할 건 없고, OAuth로 로그인해요.

2) 연결하면 뭐가 쉬워지나

| 전 | 후 |
| --- | --- |
| 배포 실패 → 대시보드 Deployments → 빌드 로그를 복사해 붙여넣기 | "최근 배포가 왜 실패했는지 빌드 로그 보고 고쳐줘" |
| 프로덕션에서만 나는 500 에러를 Logs 화면에서 찾기 | "my-app 프로덕션 runtime error 확인하고 원인 코드 찾아줘" |
| Vercel 문서 검색 | "Vercel 문서에서 Preview 환경 변수 동작 찾아서 설명해줘" |

3) 연결 명령 (macOS, Windows 동일)

```bash
# Claude Code
claude mcp add --transport http vercel https://mcp.vercel.com
claude
/mcp   # vercel 선택 → Authenticate → 브라우저에서 로그인, 접근할 팀 선택
```

```bash
# Codex: 추가할 때 OAuth를 감지해서 브라우저가 열려요
codex mcp add vercel --url https://mcp.vercel.com
# 안 열리면
codex mcp login vercel
```

```bash
# 설치된 에이전트 전부에 한 번에 추가 (Vercel 공식 Quick Setup)
npx -y add-mcp https://mcp.vercel.com -g
```

범위 좁히기

- 문서에 읽기 전용 모드는 없어요. 대신 OAuth 승인 화면에서 접근할 팀을 고르고, 필요한 팀만 허용하세요.
- Vercel MCP는 Vercel이 검토한 클라이언트(Claude Code, Codex CLI, Cursor 등)만 연결돼요.

4) 예시 프롬프트

```text
내 Vercel 팀과 프로젝트 목록 보여주고, my-app 최신 배포 상태 알려줘.
```

```text
my-app 최신 프로덕션 배포의 runtime error 확인하고, 어떤 라우트에서 나는지 정리해줘. 아직 고치지 마.
```

```text
방금 푸시한 커밋의 Preview 배포 빌드 로그 보고, 실패했으면 로컬에서 같은 에러 재현해줘.
```

5) 위험

- 문서 그대로: 연결하면 AI가 내 Vercel 계정과 같은 권한을 가져요.
- 도구가 200개가 넘어요(배포, 환경 변수, 도메인, 방화벽, 결제·구매 포함). 도메인 구매나 환경 변수 삭제 같은 호출은 승인 전에 꼭 읽으세요.
- 로그 안에 들어 있는 문자열이 프롬프트 인젝션이 될 수 있어요. 문서도 "사람 확인 단계"를 켜 두라고 해요.
- 공식 주소는 `https://mcp.vercel.com` 하나예요. 마켓플레이스 원클릭 설치는 도메인을 확인하세요.

- 스크린샷: public/refs/vercel-mcp.webp (공식 문서 Quick Setup)
- 로고: public/refs/logos/vercel-mcp.png
- 확인한 출처: vercel.com/docs/agent-resources/vercel-mcp, vercel.com/docs/agent-resources/vercel-mcp/tools (2026-10-10)

#### 2.5.3 Railway MCP

1) MCP를 한 문장으로: 에이전트가 Railway 콘솔을 대신 조작하게 해 주는 연결이에요. 서버는 `mcp.railway.com`에서 돌아가고, 내 Railway CLI 로그인을 빌려 쓰거나 OAuth로 붙어요.

2) 연결하면 뭐가 쉬워지나

| 전 | 후 |
| --- | --- |
| 서비스 → Deployments → 로그를 복사해 붙여넣기 | "backend 서비스가 배포 때 왜 죽는지 railway agent로 찾아줘" |
| Variables 화면에서 환경 변수를 하나씩 복사 | "프로젝트 환경 변수 받아서 .env로 저장해줘" |
| 템플릿 찾아서 Postgres 직접 추가 | "Postgres 데이터베이스 배포해줘" |

3) 연결 명령

방법 A. Railway CLI로 연결 (공식 기본값, CLI 5.44.0 이상)

```bash
# macOS: CLI 설치 + 로그인
brew install railway
railway login
railway --version   # 5.44.0 이상인지 확인
```

```powershell
# Windows: CLI 설치 + 로그인 (둘 중 하나)
scoop install railway
npm i -g @railway/cli
railway login
```

```bash
# 에이전트에 등록 (macOS, Windows 동일). 자동 등록 명령이 제일 간단해요
railway mcp install --agent claude-code
railway mcp install --agent codex

# 또는 수동 (Railway 문서 표기 그대로)
claude mcp add railway railway mcp
codex mcp add railway -- railway mcp
```

방법 B. OAuth로 연결 (CLI 설치 없이)

```bash
# Claude Code: 첫 도구 호출 때 인증 창이 떠요
claude mcp add railway --transport http https://mcp.railway.com
```

```toml
# Codex: ~/.codex/config.toml 에 추가
[mcp_servers.railway]
url = "https://mcp.railway.com"
```

```bash
codex mcp login railway
```

한 번에 세팅하는 명령도 있어요: `railway setup agent`(CLI 방식), `railway setup agent --oauth`(OAuth 방식).

범위 좁히기

- 읽기 전용 모드나 도구 필터는 문서에 없어요.
- OAuth 방식은 승인할 때 접근할 워크스페이스와 프로젝트를 고를 수 있고, 토큰이 짧게 유지되며 Railway 계정 설정에서 취소할 수 있어요. 범위를 좁히고 싶으면 방법 B가 나아요.
- CLI 방식은 `railway login`한 계정 전체 권한을 그대로 써요. 대신 설정 파일에 오래가는 토큰이 남지 않아요.
- 프로젝트 토큰은 받지 않아요. 사용자 계정이 필요해요.

4) 예시 프롬프트 (Railway 문서 예시)

```text
Use the railway agent to figure out why my backend service is crashing on deploy
```

```text
Pull environment variables for my project and save them to a .env file
```

```text
Redeploy my api service in the production environment
```

5) 위험

- `redeploy`, `accept-deploy`(변경 커밋 후 배포), 로컬 서버의 `remove_service`, `delete_domain`, `remove_volume` 같은 파괴적 도구가 있어요. 확인 창이 뜨면 대상 서비스와 환경 이름을 읽고 누르세요.
- Railway 문서도 "중요하지 않은 환경에서만" 쓰라고 권해요. 운영 환경 재배포는 직접 하세요.
- `railway-agent`는 Railway 쪽 AI가 여러 단계를 알아서 처리해요. 결과를 꼭 확인하세요.
- 새 서비스나 DB를 만들면 요금제에 따라 비용이 생길 수 있어요.
- `.env`로 받은 환경 변수는 `.gitignore`에 들어 있는지 확인하세요.

- 스크린샷: public/refs/railway-mcp.webp (공식 문서 Per-editor configuration)
- 로고: public/refs/logos/railway-mcp.png
- 확인한 출처: docs.railway.com/ai/mcp-server (편집기별 명령은 페이지의 CLI/OAuth 탭을 직접 렌더링해 확인), railway.com/mcp.md, docs.railway.com/reference/mcp-server, docs.railway.com/guides/cli (2026-10-10). npm @railway/cli 5.64.2.

### 2.6 Figma MCP

- 한 줄 설명: Figma 파일의 프레임·컴포넌트·변수 정보를 에이전트에게 넘겨서 코드로 옮기게 해요. 반대로 코드 화면을 Figma에 그려 넣는 기능도 있어요.
- 언제 쓰나: 팀의 디자이너가 Figma로 시안을 줬을 때. 시안 링크를 주고 "이 프레임대로 만들어줘"라고 할 때.
- 링크: https://developers.figma.com/docs/figma-mcp-server/ , 설치 https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

설치 (macOS, Windows 동일)

```bash
# Claude Code: 권장 (Anthropic 공식 마켓플레이스 플러그인)
claude plugin install figma@claude-plugins-official

# Claude Code: 수동
claude mcp add --transport http figma https://mcp.figma.com/mcp
# 새 세션에서 /mcp → figma → Authenticate → Allow Access

# Codex
codex mcp add figma --url https://mcp.figma.com/mcp
```

사용 예시

```text
이 Figma 프레임을 Next.js + Tailwind 컴포넌트로 만들어줘: https://www.figma.com/design/<파일>?node-id=<노드>. 색은 globals.css 토큰을 써.
```

주의

- 호출 한도: View·Collab 좌석은 월 20회뿐이에요. Dev·Full 좌석(Professional)은 하루 200회, 분당 10회. 교육(Education) 플랜은 Professional Dev·Full과 같은 한도예요.
- 큰 프레임을 통째로 선택하면 느리고 결과가 나빠요. 작은 단위로 나눠서 요청하세요.
- 스크린샷: public/refs/figma-mcp.webp (원격 서버 설치 문서)
- 로고: public/refs/logos/figma-mcp.png
- 확인한 출처: developers.figma.com/docs/figma-mcp-server/remote-server-installation/, /rate-limits-access/ (2026-10-10)

### 2.7 GitHub MCP (선택. 대부분은 `gh` CLI로 충분)

- 한 줄 설명: 이슈, PR, 코드 검색 같은 GitHub 기능을 MCP 도구로 열어 줘요.
- 언제 쓰나: 거의 안 써도 돼요. Claude Code 공식 모범 사례는 "외부 서비스는 CLI 도구가 컨텍스트를 가장 적게 쓴다"며 `gh` 설치를 권해요(4.4). Claude와 Codex 모두 `gh` 명령을 잘 다뤄요.
- 링크: https://github.com/github/github-mcp-server

설치 (꼭 필요할 때만, macOS·Windows 동일)

```bash
# Claude Code: 읽기 전용 URL + 개인 액세스 토큰(PAT)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/readonly -H "Authorization: Bearer <GITHUB_PAT>"

# Codex: 토큰은 환경 변수에서 읽기
codex mcp add github --url https://api.githubcopilot.com/mcp/ --bearer-token-env-var GITHUB_PAT_TOKEN
```

사용 예시

```text
이 저장소에서 라벨이 bug인 열린 이슈 목록 정리해줘.
```

주의

- PAT는 필요한 저장소·권한만 가진 fine-grained 토큰으로 만드세요. 토큰이 든 설정을 `.mcp.json`(project 범위)에 넣지 마세요.
- URL 끝에 `/readonly`를 붙이면 읽기 도구만 열려요. `/x/repos`처럼 도구 묶음(toolset) 하나만 열 수도 있어요.
- 예전 npm 패키지 `@modelcontextprotocol/server-github`는 지원 종료(deprecated)됐어요. 쓰지 마세요.
- 스크린샷: 없음
- 로고: public/refs/logos/github-mcp.png
- 확인한 출처: github.com/github/github-mcp-server README, docs/remote-server.md, docs/installation-guides/install-claude.md, install-codex.md, code.claude.com/docs/en/best-practices (2026-10-10)

### 2.8 shadcn MCP

- 한 줄 설명: shadcn 레지스트리(공식 + 서드파티)의 컴포넌트를 검색하고 설치하게 해 줘요.
- 언제 쓰나: "폼 만들어줘" 할 때 에이전트가 컴포넌트를 처음부터 짜지 않고 shadcn 컴포넌트를 가져다 쓰게 하고 싶을 때.
- 링크: https://ui.shadcn.com/docs/mcp

설치

```bash
# Claude Code (프로젝트 폴더에서, macOS·Windows 동일). 실행 후 Claude Code 재시작, /mcp로 Connected 확인
npx shadcn@latest mcp init --client claude
```

```toml
# Codex: CLI가 자동으로 못 넣어서 ~/.codex/config.toml 에 직접 추가 후 Codex 재시작
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

사용 예시

```text
shadcn 레지스트리에서 button, dialog, card 컴포넌트를 내 프로젝트에 추가해줘.
```

```text
shadcn 컴포넌트로 문의하기 폼 만들어줘. 검증은 zod로.
```

주의: 프로젝트에 shadcn/ui가 초기화돼 있어야 해요(3.4). 21st.dev 같은 서드파티 레지스트리 컴포넌트는 코드를 한 번 읽어 보고 넣으세요.
- 스크린샷: 없음 (3.4 shadcn-ui.webp 참고)
- 로고: public/refs/logos/shadcn-mcp.png
- 확인한 출처: ui.shadcn.com/docs/mcp (2026-10-10)

### 2.9 21st MCP (예전 이름 Magic MCP)

- 21st.dev의 "Magic MCP"는 "21st MCP"로 통합됐고, 예전 패키지 `@21st-dev/magic`은 옛 설정이 안 깨지게 하는 중계 패키지로만 남아 있어요. 예전 Magic API 키는 초기화됐어요.
- 자세한 내용은 디자인 섹션 3.5 21st.dev 항목에 적었어요.

---

## 3. 디자인 리소스

### 3.1 DESIGN.md (Google Stitch 공개 스펙)

- 한 줄 설명: 색·글꼴·간격·컴포넌트 규칙을 에이전트가 읽기 좋게 적는 마크다운 형식이에요. 위쪽 YAML(front matter)에 정확한 토큰 값을, 아래 본문에 "왜 이렇게 쓰는지"를 적어요.
- 언제 쓰나: "AI가 만든 티 나는" 화면을 피하고 싶을 때. 페이지마다 색과 간격이 들쭉날쭉할 때. 프로젝트 시작할 때 하나 만들어 두면 이후 모든 UI 요청의 기준이 돼요.
- 링크: 스펙 저장소 https://github.com/google-labs-code/design.md , 발표 글 https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/ , Stitch https://stitch.withgoogle.com
- 상태: 2026-04-21 공개된 초안(alpha). "형식이 바뀔 수 있다"고 명시돼 있어요.

형식 요약

```markdown
---
name: Heritage
colors:
  primary: "#1A1C1E"
  tertiary: "#B8422E"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
---

## Overview
## Colors
## Typography
## Layout
## Elevation & Depth
## Shapes
## Components
## Do's and Don'ts
```

본문 섹션은 선택이지만, 쓴다면 위 순서를 지켜야 해요. 토큰 그룹은 `colors`, `typography`, `rounded`, `spacing`, `components` 등이에요.

설치 / 세팅 (macOS, Windows 동일. 설치 없이 npx로 실행)

```bash
npx @google/design.md lint DESIGN.md                 # 구조, 깨진 토큰 참조, WCAG 대비 검사
npx @google/design.md diff DESIGN.md DESIGN-v2.md    # 바뀐 토큰 비교
npx @google/design.md export --format css-tailwind DESIGN.md   # Tailwind용 CSS 변수로 내보내기
```

Windows PowerShell에서 위 명령이 안 되면 `npx -p @google/design.md designmd lint DESIGN.md`.

에이전트에게 주는 법: 프로젝트 루트에 `DESIGN.md`를 두고 AGENTS.md/CLAUDE.md에 "UI 작업 전에 DESIGN.md를 읽고 토큰만 사용" 한 줄을 적어요.

사용 예시

```text
DESIGN.md를 읽고 globals.css의 @theme 변수로 옮겨줘. 그다음 랜딩 페이지 히어로를 이 토큰만 써서 만들어줘.
```

```text
npx @google/design.md lint DESIGN.md 돌려서 대비가 부족한 색 조합 고쳐줘.
```

주의: 출처마다 섹션 구성이 달라요. Google 스펙은 8개 섹션, VoltAgent 모음(3.3)은 "Agent Prompt Guide"를 포함한 9개 섹션 형식이에요. 둘 다 에이전트는 잘 읽지만, `lint`는 Google 스펙 기준으로 검사해요. 이 문서는 Google 저장소를 기준으로 삼았어요(원 출처이고 CLI 검증 도구가 있어서).
- 스크린샷: public/refs/design-md.webp (GitHub README "The Format" 부분)
- 로고: public/refs/logos/design-md.png (Stitch 아이콘)
- 확인한 출처: github.com/google-labs-code/design.md README, blog.google Stitch DESIGN.md 글 (2026-10-10). npm @google/design.md 0.4.0.

### 3.2 getdesign.md (`npx getdesign`)

- 한 줄 설명: 실제 서비스 디자인을 분석한 DESIGN.md 템플릿을 명령 한 줄로 내 프로젝트에 넣어 줘요. VoltAgent 팀이 운영해요.
- 언제 쓰나: 디자인 감이 없을 때 "Linear 느낌", "Apple 느낌"처럼 출발점을 고르고 싶을 때.
- 링크: https://getdesign.md , 카탈로그 https://getdesign.md/design-md

설치 / 세팅 (macOS, Windows 동일. Node 18+)

```bash
npx getdesign list            # 받을 수 있는 템플릿 목록
npx getdesign add <slug>      # 프로젝트 루트에 DESIGN.md 생성
npx getdesign add <slug> --out ./docs/design.md   # 다른 위치에
npx getdesign add <slug> --force                  # 기존 DESIGN.md 덮어쓰기
```

이미 `DESIGN.md`가 있으면 덮어쓰지 않고 `<slug>/DESIGN.md`로 따로 저장해요.

사용 예시

```text
DESIGN.md를 먼저 읽고 UI를 만들어. 토큰, 글자 크기 단계, 컴포넌트 패턴을 그대로 따라.
```

주의

- 카탈로그(550개 이상) 열람은 무료지만 "Catalog Pass", Pro 템플릿, 비공개 DESIGN.md 의뢰는 유료예요(가격은 페이지에 안 나와 있었어요).
- 다른 회사 디자인을 그대로 베끼는 건 피하세요. 출발점으로만 쓰고 색이나 글꼴은 내 서비스에 맞게 바꾸세요.
- 스크린샷: public/refs/getdesign.webp
- 로고: public/refs/logos/getdesign.png
- 확인한 출처: getdesign.md, npm `getdesign` 패키지 README (버전 0.6.25, 저장소 VoltAgent/awesome-design-md) (2026-10-10)

### 3.3 VoltAgent/awesome-design-md

- 한 줄 설명: 브랜드별 DESIGN.md를 모아 둔 GitHub 저장소예요. getdesign.md의 원본 저장소이고, 각 폴더에 라이트·다크 미리보기 HTML도 있어요.
- 언제 쓰나: CLI 없이 파일을 직접 열어 보고 복사하고 싶을 때.
- 링크: https://github.com/VoltAgent/awesome-design-md
- 설치: 없음. 원하는 브랜드 폴더의 `DESIGN.md`를 프로젝트 루트에 복사하거나 3.2의 `npx getdesign add <slug>`를 써요.
- 사용 예시: `"DESIGN.md를 기준으로 이 페이지랑 같은 느낌의 가격표 페이지 만들어줘"`
- 주의: MIT 라이선스지만 "있는 그대로" 제공돼요. 9개 섹션 형식이라 Google 스펙(3.1)과 섹션 이름이 달라요.
- 스크린샷: 없음 (3.2 getdesign.webp 참고)
- 로고: public/refs/logos/awesome-design-md.png (저장소 홈페이지인 getdesign.md 아이콘)
- 확인한 출처: github.com/VoltAgent/awesome-design-md README (2026-10-10)

### 3.4 shadcn/ui

- 한 줄 설명: 컴포넌트 코드를 내 프로젝트 안에 복사해 넣어 주는 UI 컴포넌트 모음이에요. 라이브러리가 아니라 코드라서 마음대로 고칠 수 있어요.
- 언제 쓰나: 버튼, 다이얼로그, 폼, 테이블 같은 기본 UI를 빨리 깔 때. 에이전트도 shadcn 코드를 잘 알아요.
- 링크: https://ui.shadcn.com/docs/installation/next

설치 / 세팅 (macOS, Windows 동일)

```bash
# 새 Next.js 프로젝트를 shadcn과 함께 만들기
npx shadcn@latest init -t next

# 이미 있는 Next.js 프로젝트에 넣기
npx shadcn@latest init

# 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card dialog
```

공식 문서는 `pnpm dlx shadcn@latest ...` 형태로 보여 주고 npm 탭에서는 `npx`를 써요. [shadcn/create](https://ui.shadcn.com/create)에서 색·글꼴을 고르면 `--preset` 코드가 붙은 init 명령을 만들어 줘요.

사용 예시

```text
shadcn의 card, badge, button으로 프로젝트 목록 페이지 만들어줘. 색은 globals.css 토큰만 써.
```

주의: 기본 테마 그대로 쓰면 다른 해커톤 팀과 화면이 똑같아 보여요. DESIGN.md(3.1)로 색·간격·반경을 먼저 정하세요.
- 스크린샷: public/refs/shadcn-ui.webp (Next.js 설치 문서)
- 로고: public/refs/logos/shadcn-ui.png
- 확인한 출처: ui.shadcn.com/docs/installation/next (2026-10-10). npm shadcn 4.21.4.

### 3.5 21st.dev

- 한 줄 설명: 디자인 엔지니어들이 올린 React 컴포넌트, 템플릿, shadcn 테마 모음이에요(12,000개 이상). 컴포넌트마다 "프롬프트 복사"가 있어서 Claude Code나 Codex에 그대로 붙여 넣으면 돼요.
- 언제 쓰나: 랜딩 페이지 히어로, 애니메이션 배경, 가격표처럼 눈에 띄는 블록이 필요할 때.
- 링크: https://21st.dev , 요금 https://21st.dev/pricing , MCP 저장소 https://github.com/21st-dev/magic-mcp

설치 / 세팅

- 컴포넌트 하나: 사이트에서 "Copy prompt"를 눌러 에이전트에 붙여 넣거나, 컴포넌트 페이지에 있는 shadcn CLI 설치 명령을 실행해요.
- 21st MCP (선택, API 키 필요. 21st.dev/mcp에서 발급)

```bash
# Claude Code (macOS, Windows)
claude plugin marketplace add 21st-dev/magic-mcp
# 그다음 Claude Code 안에서
/plugin install 21st

# Codex
codex plugin marketplace add 21st-dev/magic-mcp
# 그다음 Codex 안에서 /plugins 에서 "21st" 설치
```

사용 예시

```text
21st에서 가져온 이 히어로 컴포넌트 프롬프트를 적용해줘: [붙여넣기]. 우리 DESIGN.md 색으로 바꿔서.
```

주의

- 무료는 둘러보기 + 하루 2회 컴포넌트 복사예요. 무제한 복사·설치는 Builder 플랜(연 결제 기준 월 6달러), AI 생성은 별도 크레딧이에요.
- 예전 "Magic MCP" 설정과 API 키는 더 이상 그대로 안 돼요. 새 키를 받아야 해요.
- 화려한 효과를 여러 개 겹치면 오히려 산만하고 느려져요. 페이지당 하나 정도만.
- 스크린샷: public/refs/21st-dev.webp
- 로고: public/refs/logos/21st-dev.png
- 확인한 출처: 21st.dev, 21st.dev/pricing, github.com/21st-dev/magic-mcp README (2026-10-10)

### 3.6 Magic UI

- 한 줄 설명: React + Tailwind + Motion으로 만든 무료 오픈소스 애니메이션 컴포넌트 150개 이상이에요. shadcn/ui와 같은 방식으로 설치해요.
- 언제 쓰나: 마퀴(흘러가는 로고 띠), 글자 애니메이션, 지구본 같은 랜딩 페이지 효과가 필요할 때.
- 링크: https://magicui.design , 설치 https://magicui.design/docs/installation

설치 / 세팅 (macOS, Windows 동일. shadcn init이 된 프로젝트에서)

```bash
npx shadcn@latest add @magicui/globe
```

공식 문서는 `pnpm dlx shadcn@latest add @magicui/globe`로 보여 줘요. 컴포넌트 이름만 바꿔서 쓰면 돼요.

사용 예시

```text
Magic UI의 marquee 컴포넌트로 후원사 로고 띠를 만들어줘.
```

주의: 기본 컴포넌트는 무료, Magic UI Pro(블록·템플릿)는 1회 199달러예요.
- 스크린샷: public/refs/magic-ui.webp
- 로고: public/refs/logos/magic-ui.png
- 확인한 출처: magicui.design, magicui.design/docs/installation (2026-10-10)

### 3.7 Lucide (아이콘)

- 한 줄 설명: 선 굵기가 일정한 오픈소스 아이콘 세트예요(1,870개 이상). shadcn/ui의 기본 아이콘이기도 해요.
- 언제 쓰나: 버튼, 메뉴, 상태 표시에 아이콘이 필요할 때. UI에 이모지 대신 쓰세요.
- 링크: https://lucide.dev/icons/ , React 가이드 https://lucide.dev/guide/react/getting-started

설치 / 세팅 (macOS, Windows 동일)

```bash
npm install lucide-react
```

```tsx
import { Camera } from "lucide-react";

export default function App() {
  return <Camera />;
}
```

크기·색·선 굵기는 props로 바꿔요(예: `size`, `color`, `strokeWidth`).

사용 예시

```text
사이드바 메뉴 아이콘을 전부 lucide-react로 바꾸고 크기는 20, 선 굵기는 1.75로 통일해줘.
```

주의: ISC 라이선스. 아이콘을 통째로 import하지 말고 쓰는 것만 이름으로 import하세요.
- 스크린샷: public/refs/lucide.webp (아이콘 목록 페이지)
- 로고: public/refs/logos/lucide.png
- 확인한 출처: lucide.dev/guide/react/getting-started, lucide.dev/icons (2026-10-10). npm lucide-react 1.54.0.

### 3.8 Pretendard (한글 글꼴)

- 한 줄 설명: 한국어 서비스에서 가장 많이 쓰는 무료 한글 글꼴이에요. 가변(Variable) 글꼴 하나로 굵기를 자유롭게 써요.
- 언제 쓰나: 한글 화면이 있는 모든 프로젝트. 기본 시스템 글꼴보다 한글 자간과 굵기가 안정적이에요.
- 링크: https://github.com/orioncactus/pretendard , 소개 글 https://cactus.tistory.com/306

설치 / 세팅 (Next.js, macOS·Windows 동일)

```bash
npm i pretendard
# 가변 글꼴 파일을 app/fonts/ 로 복사
# macOS / Linux
mkdir -p app/fonts && cp node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 app/fonts/
```

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Force app/fonts
Copy-Item node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 app/fonts/
```

```tsx
// app/layout.tsx
import localFont from "next/font/local";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font/local`은 글꼴을 내 도메인에서 직접 제공해요(외부 요청 없음). `weight: "45 920"`은 Pretendard README가 권하는 값이고, 빼면 Safari 같은 WebKit 브라우저에서 굵기가 틀어질 수 있어요.

CDN을 쓰는 방법도 있어요(Next.js가 아닐 때): `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`, 글꼴 이름은 `"Pretendard Variable"`.

사용 예시

```text
전체 글꼴을 Pretendard로 바꿔줘. next/font/local로 app/fonts/PretendardVariable.woff2를 쓰고, Tailwind에서 font-sans가 이걸 가리키게 해.
```

주의

- SIL OFL 라이선스: 상업적 사용·수정·재배포 가능, 글꼴 자체를 파는 것만 안 돼요.
- 최신 버전은 1.3.9(2023년 이후 그대로)예요. 문제 없어요.
- 한글 본문은 자간을 살짝 좁히면(예: -0.01em ~ -0.025em) 더 자연스러워요. 기호는 취향이니 화면에서 비교해 보세요.
- 스크린샷: 없음
- 로고: 없음 (공식 로고 파일이 따로 제공되지 않음)
- 확인한 출처: github.com/orioncactus/pretendard README, jsDelivr의 pretendard@1.3.9 파일 목록, nextjs.org/docs/app/getting-started/fonts (2026-10-10)

### 3.9 레퍼런스 갤러리

에이전트에게 "예쁘게 해줘"라고 하면 흔한 디자인이 나와요. 마음에 드는 실제 화면을 찾아서 스크린샷이나 링크와 함께 "이 화면처럼"이라고 주면 결과가 훨씬 나아요.

| 사이트 | 제일 잘 맞는 용도 | 무료 / 유료 |
| --- | --- | --- |
| Mobbin | 실제 출시된 앱·웹의 화면과 흐름(온보딩, 결제) | 무료는 일부만, 플로우·애니메이션은 유료 |
| Refero | 웹앱·iOS 화면, 플로우, UX 패턴 검색 | 무료는 약 3%만, Pro 월 10달러(연 결제) |
| Recent (구 Godly) | 감각적인 웹사이트·디자인 큐레이션 | 무료 열람 |
| Awwwards | 수상작 위주의 인터랙션 많은 웹사이트 | 무료 열람 |
| Dribbble | 디자이너 개인 작업(시안·콘셉트) | 무료 열람 |
| UI Bowl | 한국 앱(토스 등) UI 패턴 | 무료는 최신 3개만, Pro 월 14,000원 |

#### Mobbin

- 한 줄 설명: 실제 출시된 앱과 사이트 화면 62만 장 이상을 모은 레퍼런스 라이브러리예요.
- 언제 쓰나: "다른 서비스는 결제 화면을 어떻게 만들었지?"처럼 실제 사례가 필요할 때.
- 링크: https://mobbin.com , 요금 https://mobbin.com/pricing
- 설치: 없음 (웹). MCP 연결은 Pro·Team 플랜 기능이에요.
- 사용 예시: 마음에 드는 화면 스크린샷을 에이전트에 붙여 넣고 `"이 레이아웃을 참고해서 우리 온보딩 화면 만들어줘. 색은 DESIGN.md 토큰으로."`
- 주의: 무료는 앱·사이트가 일부만 보이고 플로우·애니메이션은 안 보여요. 학생·교육자 할인이 있어요(요금 금액은 페이지에서 지역 통화로 표시돼 여기 적지 않았어요).
- 스크린샷: public/refs/mobbin.webp
- 로고: public/refs/logos/mobbin.png
- 확인한 출처: mobbin.com, mobbin.com/pricing (2026-10-10)

#### Refero

- 한 줄 설명: 웹앱·iOS 화면 14만 5천 장 이상과 가입부터 해지까지의 사용자 흐름을 검색할 수 있는 레퍼런스예요.
- 언제 쓰나: "SSO 로그인 화면", "요금제 비교 페이지"처럼 화면 유형으로 찾고 싶을 때.
- 링크: https://refero.design , 요금 https://refero.design/pricing
- 설치: 없음 (웹). Pro에 Figma 플러그인, Refero MCP, Refero Skill이 포함돼요.
- 사용 예시: `"Refero에서 찾은 이 대시보드 화면처럼 차트 카드 배치를 바꿔줘"` + 스크린샷
- 주의: 무료는 전체의 약 3%만 보여요. Pro는 연 결제 시 월 10달러(연 120달러), 학생은 40% 할인.
- 스크린샷: public/refs/refero.webp
- 로고: public/refs/logos/refero.png
- 확인한 출처: refero.design, refero.design/pricing (2026-10-10)

#### Godly → Recent

- 한 줄 설명: 웹사이트 영감 갤러리 Godly는 이제 Recent(recent.design)로 바뀌었어요. godly.website에 들어가면 recent.design으로 이동하고, Recent 소개 페이지에 "Godly를 대신한다"고 적혀 있어요. 웹사이트뿐 아니라 디자인, OG 이미지, 앱 아이콘, 도구까지 매일 큐레이션해요.
- 언제 쓰나: 랜딩 페이지 분위기를 잡을 때, 흔하지 않은 레이아웃 아이디어가 필요할 때.
- 링크: https://recent.design
- 설치: 없음 (웹)
- 사용 예시: 마음에 드는 사이트 링크를 주고 `"이 사이트의 타이포그래피 위계만 참고해서 우리 히어로 섹션을 다시 짜줘"`
- 주의: 열람은 무료(가입 선택). 사이트 디자인을 통째로 베끼지 말고 구조만 참고하세요.
- 스크린샷: public/refs/godly.webp (현재 recent.design 화면)
- 로고: public/refs/logos/godly.svg (recent.design 아이콘)
- 확인한 출처: godly.website 리다이렉트, recent.design/info (2026-10-10)

#### Awwwards

- 한 줄 설명: 심사를 거친 웹사이트 수상작 모음이에요. 스크롤 애니메이션, 3D, 인터랙션이 많은 사이트가 주로 올라와요.
- 언제 쓰나: 해커톤 데모용 랜딩 페이지에서 첫인상을 강하게 주고 싶을 때.
- 링크: https://www.awwwards.com
- 설치: 없음 (웹)
- 사용 예시: `"이 사이트처럼 스크롤하면 섹션이 순서대로 나타나는 효과를 Motion으로 하나만 넣어줘"`
- 주의: 열람 무료. 수상작은 무거운 효과가 많아서 그대로 따라 하면 모바일에서 느려요. 자동화된 브라우저 접근을 차단해서(403) 스크린샷을 못 찍었어요.
- 스크린샷: 없음 (자동 접근 차단)
- 로고: public/refs/logos/awwwards.png
- 확인한 출처: awwwards.com (2026-10-10, 헤드리스 브라우저 403, 일반 HTTP 요청은 200)

#### Dribbble

- 한 줄 설명: 디자이너들이 작업물(샷)을 올리는 커뮤니티예요.
- 언제 쓰나: 색 조합, 일러스트, 아이콘 스타일 같은 시각적 아이디어를 얻을 때.
- 링크: https://dribbble.com
- 설치: 없음 (웹)
- 사용 예시: `"이 샷의 색 조합만 참고해서 DESIGN.md의 accent 색 후보 3개 제안해줘"`
- 주의: 열람 무료. 실제 출시된 서비스가 아니라 콘셉트 시안이 많아서, 사용성(UX)은 Mobbin·Refero·UI Bowl에서 확인하는 게 좋아요.
- 스크린샷: public/refs/dribbble.webp (Popular Web Design)
- 로고: public/refs/logos/dribbble.png
- 확인한 출처: dribbble.com (2026-10-10)

#### UI Bowl (유아이볼)

- 한 줄 설명: 한국 앱과 웹사이트 화면을 UI 패턴(로그인, 약관동의, 결제, 마이페이지 등)과 카테고리, MAU로 찾아볼 수 있는 국내 레퍼런스예요.
- 언제 쓰나: 한국 사용자에게 익숙한 흐름(본인인증, 간편결제, 포인트)을 참고할 때. 해외 레퍼런스에는 이런 화면이 거의 없어요.
- 링크: https://uibowl.io , 멤버십 https://uibowl.io/membership
- 설치: 없음 (웹). Figma 플러그인(데스크톱 Figma), MCP는 Pro.
- 사용 예시: `"UI Bowl에서 본 토스 송금 완료 화면처럼 결과 화면을 단순하게 바꿔줘"` + 스크린샷
- 주의: 무료(Starter)는 최신 앱·웹사이트 3개만 볼 수 있어요. 개인 Pro 월 14,000원(연 구독 30% 할인 표시), 2인 이상 그룹은 1인당 월 11,900원.
- 스크린샷: public/refs/ui-bowl.webp
- 로고: public/refs/logos/ui-bowl.png
- 확인한 출처: uibowl.io, uibowl.io/membership (2026-10-10)

---

## 4. 배포·백엔드 CLI와 기본 도구

### 4.1 Homebrew (macOS) / WinGet (Windows)

- 한 줄 설명: 명령 한 줄로 개발 도구를 설치·업데이트하는 패키지 관리자예요.
- 언제 쓰나: 새 노트북 세팅 맨 처음.
- 링크: https://brew.sh , https://learn.microsoft.com/en-us/windows/package-manager/winget/

설치 (macOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew --version
```

설치 (Windows)

```powershell
# Windows 11과 최신 Windows 10(1809 이상)은 "앱 설치 관리자(App Installer)"에 winget이 들어 있어요
winget --version
# 없으면 Microsoft Store에서 "앱 설치 관리자"를 설치
```

- 사용 예시: `brew install gh`, `winget install --id GitHub.cli --source winget`
- 주의: Homebrew 설치가 끝나면 터미널에 다음 단계 안내(PATH 설정 명령)가 나와요. 안내된 명령을 그대로 실행하고 새 터미널을 열어야 `brew`가 잡혀요. winget은 관리자 PowerShell에서 실행하면 권한 확인 창 없이 설치되니, 믿는 앱만 설치하세요.
- 스크린샷: 없음
- 로고: public/refs/logos/homebrew.png
- 확인한 출처: brew.sh (Homebrew 7.0.0 공지 확인), learn.microsoft.com winget 문서 (2026-10-10)

### 4.2 Node.js

- 한 줄 설명: Next.js, npm, npx를 돌리는 자바스크립트 실행 환경이에요.
- 언제 쓰나: 거의 모든 웹 프로젝트의 전제 조건.
- 링크: https://nodejs.org/en/download
- 버전: 2026-10-10 기준 LTS는 v24.21.0(코드명 Krypton). v26은 아직 "Current"예요. 해커톤에는 24 LTS를 쓰세요.

설치 (macOS)

```bash
# 방법 1 (가장 쉬움): nodejs.org에서 macOS Installer (.pkg) 받아서 실행

# 방법 2: nodejs.org가 기본으로 보여 주는 nvm 방식
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24

# 방법 3: fnm (버전 여러 개 쓸 때)
brew install fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
source ~/.zshrc
fnm install --lts
```

설치 (Windows)

```powershell
# 방법 1 (가장 쉬움): nodejs.org에서 Windows Installer (.msi) 받아서 실행

# 방법 2: winget
winget install OpenJS.NodeJS.LTS

# 방법 3: fnm
winget install Schniz.fnm
# PowerShell 프로필($PROFILE) 끝에 아래 줄 추가 후 새 창 열기
# fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
fnm install --lts
```

확인

```bash
node -v   # v24.x
npm -v
```

- 사용 예시: `npx create-next-app@latest my-app`
- 주의: Supabase CLI(npx)는 Node 20+, next-devtools-mcp는 20.19+, Claude Code npm 설치는 22+가 필요해요. 24 LTS면 전부 만족해요. 설치 방법을 섞으면(.pkg + nvm 등) 버전이 꼬이니 하나만 쓰세요.
- 스크린샷: public/refs/nodejs.webp (다운로드 페이지, v24.21.0 LTS + nvm 명령)
- 로고: public/refs/logos/nodejs.svg (nodejs.org가 제공하는 JS 아이콘. 정사각형이 아닌 71x80 비율)
- 확인한 출처: nodejs.org/en/download, nodejs.org/dist/index.json, github.com/Schniz/fnm README와 docs/commands.md, microsoft/winget-pkgs의 OpenJS.NodeJS.LTS 매니페스트 (2026-10-10)

### 4.3 Git (Git for Windows 포함)

- 한 줄 설명: 코드 변경 이력을 저장하는 도구예요. 에이전트가 망친 코드를 되돌리는 가장 확실한 안전장치예요.
- 언제 쓰나: 프로젝트 시작부터 항상.
- 링크: https://git-scm.com/install/windows , https://git-scm.com/install/mac

설치 (macOS)

```bash
xcode-select --install   # Apple 개발 도구에 포함된 git
# 또는
brew install git
```

설치 (Windows)

```powershell
winget install --id Git.Git -e --source winget
# 또는 git-scm.com/install/windows 에서 설치 파일 (2026-10-10 기준 2.56.0)
```

처음 한 번

```bash
git config --global user.name "내 이름"
git config --global user.email "깃허브에 등록한 이메일"
```

- 사용 예시: `git init`, `git add -A`, `git commit -m "feat: add login page"`
- 주의: Windows에서 Claude Code는 Git for Windows가 있어야 Git Bash로 명령을 실행해요. 설치 후 터미널을 새로 열어야 PATH가 잡혀요.
- 스크린샷: 없음
- 로고: public/refs/logos/git.png (git-scm.com 공식 로고 페이지의 Git-Icon-1788C)
- 확인한 출처: git-scm.com/install/windows, git-scm.com/install/mac, code.claude.com/docs/en/setup (2026-10-10)

### 4.4 GitHub CLI (`gh`)

- 한 줄 설명: 터미널에서 GitHub 저장소 생성, PR, 이슈를 다루는 공식 도구예요. 에이전트가 GitHub 작업을 할 때 MCP보다 토큰을 적게 써요.
- 언제 쓰나: 저장소 만들기, PR 올리기, 이슈 확인. "PR 만들어줘"를 에이전트에게 시키려면 깔아 두세요.
- 링크: https://cli.github.com , 매뉴얼 https://cli.github.com/manual/

설치

```bash
# macOS
brew install gh
brew upgrade gh   # 업데이트
```

```powershell
# Windows
winget install --id GitHub.cli --source winget
winget upgrade --id GitHub.cli --source winget   # 업데이트
```

처음 한 번 / 자주 쓰는 명령

```bash
gh auth login                                   # 브라우저 로그인
gh repo create my-app --private --source=. --push   # 현재 폴더로 원격 저장소 만들고 푸시
gh pr create                                    # PR 만들기
gh issue list
```

- 사용 예시 (에이전트에게): `"변경사항 커밋하고 feat/login 브랜치로 푸시한 다음 gh로 PR 만들어줘. PR 설명에 바뀐 점과 테스트 방법 적어."`
- 주의: `gh auth login` 토큰은 내 GitHub 계정 권한이에요. 에이전트가 `gh repo delete` 같은 명령을 제안하면 멈추고 확인하세요.
- 스크린샷: public/refs/gh-cli.webp (cli.github.com, Homebrew 설치 명령)
- 로고: public/refs/logos/gh-cli.png (GitHub 아이콘)
- 확인한 출처: cli/cli 저장소 docs/install_macos.md, docs/install_windows.md, cli.github.com/manual/gh_repo_create, code.claude.com/docs/en/best-practices (2026-10-10)

### 4.5 Vercel CLI

- 한 줄 설명: 터미널에서 Vercel 배포, 환경 변수, 로그를 다루는 도구예요.
- 언제 쓰나: 대시보드 없이 배포하거나, 대시보드의 환경 변수를 로컬 `.env.local`로 받아올 때. 보통은 GitHub에 푸시하면 자동 배포되니, CLI는 환경 변수와 로그 확인에 더 자주 써요.
- 링크: https://vercel.com/docs/cli , 환경 변수 https://vercel.com/docs/cli/env

설치 (macOS, Windows 동일)

```bash
npm i -g vercel
vercel --version
vercel login
```

자주 쓰는 명령

```bash
vercel link                              # 이 폴더를 Vercel 프로젝트에 연결
vercel                                   # Preview 배포
vercel --prod                            # Production 배포 (vercel deploy --prod 와 같음)
vercel env add OPENAI_API_KEY production # 환경 변수 추가 (값은 대화형으로 입력)
vercel env pull .env.local               # Development 환경 변수를 로컬 파일로
vercel env run -- npm run dev            # 파일에 안 쓰고 환경 변수 주입해서 실행
vercel logs <배포URL>                    # 런타임 로그
```

- 사용 예시 (에이전트에게): `"vercel env pull로 .env.local 갱신하고, 빠진 환경 변수가 있으면 목록만 알려줘. 값은 출력하지 마."`
- 주의
  - `echo 값 | vercel env add ...`처럼 값을 명령줄에 쓰면 셸 기록에 남아요(공식 문서 경고). 대화형 입력을 쓰세요.
  - `vercel env pull`은 기존 파일과 합쳐요. Secret 타입 값은 읽어올 수 없어서 빈 자리표시만 들어갈 수 있어요.
  - `.env.local`이 `.gitignore`에 있는지 꼭 확인하세요.
  - `vercel setup`으로 Claude Code·Codex용 Vercel 플러그인을 설치할 수도 있어요(선택).
- 스크린샷: public/refs/vercel-cli.webp (CLI 개요, 설치 명령)
- 로고: public/refs/logos/vercel-cli.png
- 확인한 출처: vercel.com/docs/cli (2026-10-07 갱신본), vercel.com/docs/cli/env (2026-10-10 확인). npm vercel 63.1.0.

### 4.6 Supabase CLI

- 한 줄 설명: Supabase 스키마를 마이그레이션 파일로 관리하고, 원격 프로젝트에 반영하고, 타입을 생성하는 도구예요.
- 언제 쓰나: 대시보드에서 테이블을 손으로 만들지 않고, 에이전트가 만든 SQL을 파일로 남기면서 반영하고 싶을 때. 팀원끼리 같은 스키마를 맞출 때.
- 링크: https://supabase.com/docs/guides/local-development/cli/getting-started , 마이그레이션 https://supabase.com/docs/guides/deployment/database-migrations

설치

```bash
# 권장 (macOS, Windows 공통): 프로젝트 개발 의존성으로 설치하고 npx로 실행. Node 20+
npm install supabase --save-dev
npx supabase --help

# macOS 전역 설치
brew install supabase/tap/supabase
```

```powershell
# Windows 전역 설치 (Scoop이 있을 때)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

자주 쓰는 흐름 (npx 기준)

```bash
npx supabase login                               # 브라우저로 로그인
npx supabase init                                # supabase/ 폴더 생성 (로컬 파일만)
npx supabase link --project-ref <ref>            # 원격 프로젝트 연결 (DB 비밀번호 물어봄)
npx supabase migration new create_todos          # supabase/migrations/에 빈 SQL 파일 생성
npx supabase db push                             # 마이그레이션을 원격 DB에 반영
npx supabase gen types --lang typescript --linked > lib/database.types.ts   # 타입 생성
```

- 사용 예시 (에이전트에게): `"todos 테이블과 RLS 정책을 마이그레이션 파일로 만들어줘. db push는 내가 직접 할게."`
- 주의
  - `supabase start`(로컬 DB), `db pull`, `db diff`는 Docker(macOS는 OrbStack 권장, Windows는 Docker Desktop)가 필요해요. 원격 프로젝트만 쓰면 Docker 없이 `link`, `migration new`, `db push`로 충분해요.
  - `db push`는 원격 DB를 바꿔요. 운영 프로젝트에 하기 전에 SQL을 직접 읽으세요.
  - DB 비밀번호와 service_role 키는 `.env.local`에만. 코드나 AGENTS.md에 쓰지 마세요.
  - `gen types` 예시는 공식 레퍼런스의 `--lang`, `--linked` 플래그를 조합한 거예요.
- 스크린샷: public/refs/supabase-cli.webp (Install the Supabase CLI 섹션)
- 로고: public/refs/logos/supabase-cli.png
- 확인한 출처: supabase.com/docs/guides/local-development/cli/getting-started, /guides/deployment/database-migrations, /reference/cli/supabase-link, /reference/cli/supabase-db-pull, /reference/cli/supabase-gen-types (2026-10-10). npm supabase 2.120.0.

(Railway CLI는 2.5.3 Railway MCP 항목에 설치법을 같이 적었어요.)

---

## 5. 검증·디버깅 습관

에이전트는 "끝난 것처럼 보이면" 멈춰요. 확인 수단을 같이 줘야 진짜로 끝나요. Claude Code 공식 모범 사례의 첫 항목도 "Claude가 스스로 확인할 수단을 줘라"예요.

### 5.1 브라우저 확인을 에이전트에게 맡기기

- Playwright MCP, Chrome DevTools MCP, Next.js MCP(2.2~2.4) 중 하나를 연결하고, 프롬프트에 확인 단계를 붙여요.

```text
수정한 다음 localhost:3000/login을 열어서 1) 빈 값 제출 2) 틀린 비밀번호 3) 정상 로그인 세 경우를 확인하고, 각각 스크린샷과 콘솔 에러 유무를 보여줘. 375px 폭에서도 한 번.
```

- "됐어요"라는 말 대신 증거(명령 출력, 스크린샷)를 보여 달라고 하세요. 증거를 보는 게 직접 다시 확인하는 것보다 빨라요.

### 5.2 에러는 어디서 읽나

| 증상 | 볼 곳 |
| --- | --- |
| 페이지가 아예 안 뜸, 500 에러, Route Handler·서버 컴포넌트 에러 | `npm run dev`를 띄운 터미널 |
| 버튼이 안 눌림, 화면 일부가 안 나옴, hydration 에러 | 브라우저 개발자 도구 Console (Mac `Cmd+Option+I`, Windows `F12`) |
| API 호출 실패(401, 403, 500), CORS | 개발자 도구 Network 탭에서 해당 요청의 상태 코드와 응답 본문 |
| 로컬은 되는데 배포 후 안 됨 | Vercel 빌드 로그·런타임 로그 (`vercel logs <URL>` 또는 Vercel MCP), 환경 변수 누락부터 의심 |
| DB 권한 에러(빈 배열, permission denied) | Supabase RLS 정책, Supabase 로그 |

- Next.js 16의 `next dev`는 브라우저 콘솔 에러·경고를 터미널에도 찍어 줘요(`logging.browserToTerminal` 설정). 그래서 에이전트가 터미널 출력만 읽어도 클라이언트 에러를 볼 수 있어요.
- 에러를 줄 때는 전체 메시지 + 어떤 행동을 했을 때 났는지 + 기대한 결과를 같이 줘요.

```text
/dashboard에서 "저장" 버튼을 누르면 Network 탭에 POST /api/posts가 401로 떠. 응답 본문: [붙여넣기]. 로그인은 된 상태야. 원인을 먼저 설명하고, 내가 동의하면 고쳐줘.
```

### 5.3 작게 커밋하고, 망하면 되돌리기

```bash
git switch -c feat/login        # 작업마다 새 브랜치
git status                      # 뭐가 바뀌었는지
git diff                        # 어떻게 바뀌었는지 (에이전트 작업 후 꼭 훑어보기)
git add -A && git commit -m "feat: add login form"   # 동작 확인된 단위마다 커밋

git restore app/page.tsx        # 이 파일의 커밋 안 된 변경 버리기
git restore .                   # 커밋 안 된 변경 전부 버리기 (되돌릴 수 없음, 신중히)
git log --oneline               # 지난 커밋 목록
```

- 기능 하나가 동작하면 바로 커밋해요. 다음 요청이 망가뜨려도 그 커밋으로 돌아가면 돼요.
- Claude Code: `Esc`로 멈추고, `Esc` 두 번 또는 `/rewind`로 이전 시점으로 되돌려요. 단 명령어로 바뀐 파일은 못 되돌리니 git이 기본이에요.
- Codex: `/diff`로 변경 확인, `/review`로 리뷰, 빈 입력창에서 `Esc` 두 번으로 이전 메시지부터 다시.
- 같은 문제를 두 번 고쳐도 안 되면 `/clear`(Claude Code) 또는 `/new`(Codex)로 새 대화를 열고, 지금까지 알게 된 걸 담아 처음부터 다시 요청하는 게 빨라요(공식 모범 사례).
- 위험한 명령(`git reset --hard`, `git push --force`, `rm -rf`, DB `drop`)은 에이전트가 제안해도 바로 승인하지 말고 무엇이 사라지는지 먼저 물어보세요.

### 5.4 키 관리

- API 키(OpenAI, Supabase service_role 등)는 `.env.local`에만 두고, `.gitignore`에 `.env*`가 있는지 프로젝트 시작할 때 확인해요.
- 키가 GitHub에 올라갔다면 파일을 지우는 걸로는 부족해요. 해당 서비스에서 키를 바로 재발급(rotate)하세요.
- `NEXT_PUBLIC_`으로 시작하는 변수는 브라우저에 그대로 노출돼요. 비밀 키에 붙이면 안 돼요.

---

## 6. 새 노트북 첫 세팅 체크리스트 (순서대로)

1. 패키지 관리자
   - macOS: Homebrew 설치 (4.1), 설치 끝에 안내되는 PATH 명령 실행
   - Windows: `winget --version` 확인. 터미널은 Windows Terminal + PowerShell 권장
2. Node.js 24 LTS (4.2) → `node -v`
3. Git (4.3) → `git config --global user.name/user.email`
4. GitHub CLI (4.4) → `gh auth login`
5. 에디터: VS Code 또는 Cursor
   - macOS `brew install --cask visual-studio-code`
   - Windows `winget install -e --id Microsoft.VisualStudioCode`
6. 에이전트 하나 이상 (1.1, 1.2)
   - Claude Code: 설치 → `claude --version` → 프로젝트 폴더에서 `claude` → 로그인 → `/init`
   - Codex: 설치 → 프로젝트 폴더에서 `codex` → Sign in with ChatGPT → `/init`
7. 먼저 넣을 MCP 2~3개
   - 브라우저 확인용 하나: Playwright MCP (2.3) 또는 Chrome DevTools MCP (2.4)
   - Next.js 16 프로젝트면: next-devtools-mcp (2.2)
   - 라이브러리 문서용: Context7 (2.1)
   - 확인: Claude Code `claude mcp list`, Codex `codex mcp list` 또는 세션 안에서 `/mcp`
8. 배포·백엔드 CLI
   - `npm i -g vercel` → `vercel login` (4.5)
   - 프로젝트 안에서 `npm install supabase --save-dev` → `npx supabase login` (4.6)
9. 프로젝트 시작할 때마다
   - `.gitignore`에 `.env*` 있는지 확인
   - AGENTS.md(또는 CLAUDE.md)에 실행·빌드 명령과 규칙 3~5줄
   - DESIGN.md 하나 (`npx getdesign add <slug>`로 시작해서 고치기)
   - 첫 커밋 → `gh repo create <이름> --private --source=. --push`
10. Supabase MCP / Vercel MCP / Railway MCP는 실제로 필요해졌을 때, 읽기 전용·프로젝트 하나로 좁혀서 추가 (2.5)

---

## 7. 공식 학습 자료

- Claude Code 문서 시작점: https://code.claude.com/docs/en/overview
- Claude Code 퀵스타트: https://code.claude.com/docs/en/quickstart
- Claude Code 모범 사례 (꼭 한 번 읽기): https://code.claude.com/docs/en/best-practices
- Claude Code 권한 모드: https://code.claude.com/docs/en/permission-modes
- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Anthropic Academy (Claude Code 101, Claude Code in Action, 스킬·서브에이전트 입문 강좌): https://anthropic.skilljar.com/ (Skilljar 계정 필요. 가격 표기는 확인하지 못함)
- Codex CLI 문서: https://learn.chatgpt.com/docs/codex/cli
- Codex 승인·보안: https://learn.chatgpt.com/docs/agent-approvals-security
- Codex AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex MCP: https://learn.chatgpt.com/docs/extend/mcp
- AGENTS.md 형식: https://agents.md
- Next.js 문서 (16.4.0): https://nextjs.org/docs
- Next.js와 AI 코딩 에이전트: https://nextjs.org/docs/app/guides/ai-agents
- Supabase 문서: https://supabase.com/docs
- Supabase MCP: https://supabase.com/docs/guides/ai-tools/mcp
- Vercel CLI: https://vercel.com/docs/cli
- DESIGN.md 스펙: https://github.com/google-labs-code/design.md

---

## 제외한 도구와 이유

- Puppeteer MCP (`@modelcontextprotocol/server-puppeteer`): npm에서 지원 종료(deprecated). Playwright MCP나 Chrome DevTools MCP로 대체.
- 예전 GitHub MCP 패키지 (`@modelcontextprotocol/server-github`): 지원 종료. 공식 `github/github-mcp-server`가 있지만 초보자는 `gh` CLI로 충분해서 선택 항목으로만 남김.
- 21st.dev Magic MCP라는 이름: 21st MCP로 통합됨. 21st.dev 항목에서만 다룸.
- Godly: 독립 사이트가 아니라 Recent(recent.design)로 바뀜. Recent로 안내.
- v0, Lovable, Bolt 같은 브라우저형 앱 생성 도구: 이 문서는 Claude Code/Codex로 내 저장소를 직접 다루는 흐름이 목적이라 뺌.
- Windsurf, Gemini CLI 등 다른 에이전트: 대상 독자가 Claude 또는 Codex 구독자라 뺌.
- Upstash, Sentry 등 기타 MCP: 해커톤 범위에서 우선순위가 낮아 뺌.

## 출처가 서로 달랐던 부분과 판단

- Codex 문서 주소: developers.openai.com/codex/* 가 learn.chatgpt.com/docs/* 로 308 영구 이동. 이동한 주소를 기준으로 삼음.
- Codex의 Windows 지원: CLI 페이지는 Windows/WSL 여부를 명시하지 않았지만, GitHub README에 PowerShell 설치 명령이 있고 Windows sandbox 문서가 "CLI를 Windows에서 쓸 수 있다"고 적어서 네이티브 지원으로 판단. WSL 문서는 리눅스 도구가 필요할 때의 선택지로 소개.
- Claude Code의 AGENTS.md 처리: 예전에는 `CLAUDE.md`에 `@AGENTS.md`를 넣어야 했지만, 현재 문서는 v2.1.277부터 직접 읽는다고 함. 현재 문서를 따름.
- Playwright MCP의 Codex 명령: README는 `codex mcp add playwright npx "@playwright/mcp@latest"`(구분자 `--` 없음), Codex 공식 문서는 `codex mcp add <이름> -- <명령>` 형식. Codex 공식 문법을 따름.
- Context7 설치: GitHub README는 `npx ctx7 setup`을 앞세우고, 클라이언트별 문서는 원격 URL + `Authorization: Bearer` 헤더 방식, Codex 문서는 `npx -y @upstash/context7-mcp`. 세 가지 모두 적고 키를 파일에 남기지 않는 방식을 함께 표시.
- DESIGN.md 섹션 구성: Google 스펙은 8개, VoltAgent 모음은 9개(Agent Prompt Guide 포함). 원 출처이고 lint 도구가 있는 Google 스펙을 기준으로 삼음.
- getdesign 명령: 서드파티 글은 `npx getdesign@latest add`, npm README는 `npx getdesign add`. npm README를 따름(둘 다 동작).
- Supabase MCP 문서 주소: /guides/getting-started/mcp 가 /guides/ai-tools/mcp 로 이동.
- Railway MCP: 옛 레퍼런스와 검색 결과에는 `npx @railway/mcp-server` 방식이 남아 있지만, 현재 공식 문서는 `railway mcp`(CLI 경유) 또는 `https://mcp.railway.com`(OAuth)만 안내. 현재 문서를 따름. 커뮤니티 패키지 `@jasontanswe/railway-mcp`는 공식이 아니라서 뺌.
- Railway의 Claude Code 수동 명령: Railway 문서는 `claude mcp add railway railway mcp`(구분자 없음), Claude Code 문서는 stdio 서버에 `--`를 권장. 그래서 공식 자동 등록 명령 `railway mcp install --agent claude-code`를 먼저 안내함.
- 21st.dev 무료 범위: 메인 페이지는 "하루 2회 무료 복사", 요금 페이지는 유료 플랜만 표로 보여 줌. 두 내용을 같이 적음.

## 확인하지 못한 것

- Mobbin Pro 가격: 페이지가 지역 통화로 렌더링되고 텍스트에 숫자가 안 잡혀서 금액을 적지 않음.
- getdesign.md의 Catalog Pass, Pro 템플릿 가격: 페이지에 금액 없음.
- Anthropic Academy 강좌의 무료 여부: 목록 페이지에 가격 표기 없음.
- Stitch의 DESIGN.md 스펙 페이지(stitch.withgoogle.com/docs/design-md/specification): 자바스크립트로만 렌더링돼 내용을 못 읽음. GitHub 스펙 저장소로 대체 확인.
- Awwwards: 헤드리스 브라우저 접근이 403으로 차단돼 스크린샷 없음.
- Vercel MCP 읽기 전용 모드: 문서에 없음(팀 단위 OAuth 승인만 있음).
- Railway MCP 읽기 전용 모드: 문서에 없음.

## Sources

AI 코딩 에이전트
- https://code.claude.com/docs/en/overview
- https://code.claude.com/docs/en/setup
- https://code.claude.com/docs/en/quickstart
- https://code.claude.com/docs/en/permission-modes
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/commands
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/chrome
- https://code.claude.com/docs/en/best-practices
- https://learn.chatgpt.com/docs/codex/cli
- https://github.com/openai/codex
- https://learn.chatgpt.com/docs/agent-approvals-security
- https://learn.chatgpt.com/docs/permission-modes
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://learn.chatgpt.com/docs/developer-commands?surface=cli
- https://learn.chatgpt.com/docs/build-skills
- https://learn.chatgpt.com/docs/extend/mcp
- https://learn.chatgpt.com/docs/windows/windows-sandbox
- https://learn.chatgpt.com/docs/windows/wsl
- https://learn.chatgpt.com/docs/pricing
- https://agents.md
- https://cursor.com/pricing

MCP 서버
- https://github.com/upstash/context7
- https://context7.com/docs/resources/all-clients
- https://context7.com/plans
- https://nextjs.org/docs/app/guides/mcp
- https://github.com/vercel/next-devtools-mcp
- https://github.com/microsoft/playwright-mcp
- https://github.com/microsoft/playwright-cli
- https://github.com/ChromeDevTools/chrome-devtools-mcp
- https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md
- https://supabase.com/docs/guides/ai-tools/mcp
- https://vercel.com/docs/agent-resources/vercel-mcp
- https://vercel.com/docs/agent-resources/vercel-mcp/tools
- https://docs.railway.com/ai/mcp-server
- https://docs.railway.com/reference/mcp-server
- https://railway.com/mcp.md
- https://docs.railway.com/guides/cli
- https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
- https://github.com/github/github-mcp-server
- https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
- https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md
- https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-codex.md
- https://ui.shadcn.com/docs/mcp
- https://github.com/21st-dev/magic-mcp

디자인
- https://github.com/google-labs-code/design.md
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
- https://getdesign.md
- https://www.npmjs.com/package/getdesign
- https://github.com/VoltAgent/awesome-design-md
- https://ui.shadcn.com/docs/installation/next
- https://21st.dev , https://21st.dev/pricing
- https://magicui.design , https://magicui.design/docs/installation
- https://lucide.dev/guide/react/getting-started , https://lucide.dev/icons/
- https://github.com/orioncactus/pretendard
- https://nextjs.org/docs/app/getting-started/fonts , https://nextjs.org/docs/app/api-reference/components/font
- https://mobbin.com , https://mobbin.com/pricing
- https://refero.design , https://refero.design/pricing
- https://recent.design , https://recent.design/info
- https://www.awwwards.com
- https://dribbble.com
- https://uibowl.io , https://uibowl.io/membership

CLI와 기본 도구
- https://brew.sh
- https://learn.microsoft.com/en-us/windows/package-manager/winget/
- https://nodejs.org/en/download , https://nodejs.org/dist/index.json
- https://github.com/Schniz/fnm
- https://git-scm.com/install/windows , https://git-scm.com/install/mac , https://git-scm.com/community/logos
- https://github.com/cli/cli/blob/trunk/docs/install_macos.md
- https://github.com/cli/cli/blob/trunk/docs/install_windows.md
- https://cli.github.com/manual/gh_repo_create
- https://vercel.com/docs/cli , https://vercel.com/docs/cli/env
- https://supabase.com/docs/guides/local-development/cli/getting-started
- https://supabase.com/docs/guides/deployment/database-migrations
- https://supabase.com/docs/reference/cli/supabase-link
- https://supabase.com/docs/reference/cli/supabase-db-pull
- https://supabase.com/docs/reference/cli/supabase-gen-types
- https://nextjs.org/docs/app/guides/ai-agents
- https://anthropic.skilljar.com/

모든 링크는 2026-10-10에 접속해 응답(200)을 확인했어요. 버전 숫자는 같은 날 npm 레지스트리(`npm view`)로 확인했어요.
