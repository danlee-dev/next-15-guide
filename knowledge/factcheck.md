# 팩트체크: 바이브코딩 실습 노트 주장 29개

- 기준일: 2026-10-10. 모든 출처는 이 날짜에 다시 열어 봤어요.
- 확인 순서: 공식 문서, 공식 변경 이력, 공식 GitHub 소스 코드. 공식 자료가 없을 때만 믿을 만한 2차 출처를 썼고, 그 경우 따로 적었어요.
- "수정 문구"는 노트에 그대로 넣을 수 있게 해요체로 짧게 썼어요. 판정이 "맞음"이어도 초보자가 자주 걸리는 부분이 있으면 "보충 문구"를 달았어요.
- 기준 버전: Claude Code v2.1.283 이상, create-next-app / next 16.4.0 (npm latest, 2026-10-06 배포), Codex CLI는 openai/codex main 브랜치 소스.

## 요약표

| ID | 주제 | 판정 |
| - | - | - |
| C1 | Claude Code plan 모드 (Shift+Tab) | 부분적으로 맞음 |
| C2 | CLAUDE.md 의 `@AGENTS.md` import | 맞음 |
| C3 | AI에게 커밋 시키기 | 맞음 |
| C4 | 긴 대화, docs 기록 후 새 세션 | 맞음 |
| C5 | 계획-리뷰-실행-확인-커밋 루프 | 맞음 |
| C6 | Codex 의 AGENTS.md, 계획 먼저 받기 | 부분적으로 맞음 |
| C7 | 서버 끄기는 Mac 도 Ctrl+C | 맞음 |
| C8 | 위 화살표로 이전 명령 | 맞음 |
| C9 | Finder 숨김 파일 Cmd+Shift+. | 맞음 |
| C10 | VS Code 폴더 열기 후 터미널 위치 | 맞음 |
| C11 | Windows 실행 정책 에러와 Y 응답 | 부분적으로 맞음 |
| C12 | git push 첫 인증 | 맞음 |
| C13 | GitHub + 버튼, README 끄기 | 맞음 (기본값 부분은 확인 불가) |
| C14 | Supabase 새 테이블 자동 노출 중단, 42501 | 부분적으로 맞음 |
| C15 | RLS 정책 0개 + secret 키 우회 | 부분적으로 맞음 |
| C16 | Project URL / secret key 위치 | 부분적으로 맞음 |
| C17 | SQL Editor "Success. No rows returned" | 맞음 |
| C18 | create-next-app `--yes` 기본값, git, AGENTS.md | 부분적으로 맞음 |
| C19 | cacheComponents 기본 켜짐, Suspense 필요 | 부분적으로 맞음 |
| C20 | .env.local 수정 후 재시작 필요 | 틀림 |
| C21 | NEXT_PUBLIC_ 만 브라우저에 들어감 | 맞음 |
| C22 | Responses API 구조화 출력 strict 규칙 | 맞음 |
| C23 | gpt-6-luna / gpt-5.4-mini 모델 ID | 맞음 |
| C24 | Pretendard 자간, keep-all | 부분적으로 맞음 |
| C25 | 큰 라운드 값, 안쪽 = 바깥 - padding | 부분적으로 맞음 |
| C26 | getdesign CLI, DESIGN.md 는 Stitch 표준 | 부분적으로 맞음 |
| C27 | create-next-app 이 main 브랜치로 첫 커밋 | 부분적으로 맞음 |
| C28 | 빈 GitHub 저장소의 push 안내 3줄 | 맞음 (페이지 문구 자체는 2차 출처) |
| C29 | README 있는 폴더에서 create-next-app 거부 | 맞음 |

---

## Claude Code

### C1. plan 모드

- 주장: "Claude Code에서 Shift+Tab으로 plan 모드를 켜면 코드를 안 건드리고 계획만 세운다 (Mac, Windows 동일)."
- 판정: 부분적으로 맞음
- 설명: Shift+Tab 은 한 번에 plan 으로 가지 않고 모드를 순서대로 돌려요. v2.1.283 부터 터미널과 VS Code 세션의 시작 모드가 auto 라서 auto → manual → accept edits → plan 순으로 세 번 눌러야 하고, Windows 에서 Node/Bun 런타임이 VT 입력 모드를 켜지 못하면 Shift+Tab 대신 Alt+M 이에요. plan 모드에서도 파일 읽기와 탐색용 셸 명령은 실행되고, 소스 수정만 승인 전까지 막혀요.
- 수정 문구: "Shift+Tab 을 화면 아래에 `plan mode on` 이 보일 때까지 눌러요(최신 버전은 보통 세 번). 프롬프트 앞에 `/plan` 을 붙여도 돼요. plan 모드에서는 파일을 읽고 계획만 세우고, 내가 승인하기 전에는 코드를 고치지 않아요. Windows 에서 Shift+Tab 이 안 먹으면 Alt+M 을 눌러요. VS Code 확장과 데스크톱 앱은 입력창의 모드 메뉴에서 Plan 을 골라요."
- 출처:
  - https://code.claude.com/docs/en/permission-modes (날짜 표기 없음, 2026-10-10 확인. "From `auto`, the first press switches to `default`")
  - https://code.claude.com/docs/en/interactive-mode (Shift+Tab / Alt+M 항목)
  - https://code.claude.com/docs/en/common-workflows ("Plan before editing")

### C2. CLAUDE.md 의 `@AGENTS.md`

- 주장: "Claude Code는 CLAUDE.md를 읽는다. 프로젝트의 CLAUDE.md에 `@AGENTS.md` 한 줄을 넣으면 AGENTS.md 내용도 읽는다." + Claude Code 가 import 없이 AGENTS.md 를 읽는지
- 판정: 맞음
- 설명: `@path` import 는 공식 기능이고, 공식 문서도 같은 방법을 안내해요. 추가로 v2.1.277 부터는 import 없이도 AGENTS.md 를 직접 읽지만, 기본 설정에서는 작업 폴더나 상위 폴더에 CLAUDE.md(또는 CLAUDE.local.md)가 하나라도 있으면 AGENTS.md 를 건너뛰어요. 그래서 CLAUDE.md 가 있는 프로젝트에선 `@AGENTS.md` 한 줄이 여전히 필요하고, 두 번 읽히지도 않아요.
- 보충 문구: "Claude Code 는 CLAUDE.md 가 없으면 AGENTS.md 를 바로 읽어요(v2.1.277 이상). CLAUDE.md 가 있으면 AGENTS.md 는 안 읽으니까, CLAUDE.md 맨 위에 `@AGENTS.md` 한 줄을 넣어 두세요."
- 참고: create-next-app 16.2~16.3 은 `@AGENTS.md` 한 줄짜리 CLAUDE.md 를 같이 만들었지만, 16.4.0(2026-10-06)부터는 "Claude Code 가 AGENTS.md 를 직접 읽는다"는 이유로 AGENTS.md 만 만들어요.
- 출처:
  - https://code.claude.com/docs/en/memory ("AGENTS.md" 섹션, "Reading `AGENTS.md` directly requires Claude Code v2.1.277 or later")
  - https://github.com/vercel/next.js/commit/43f54d52f (2026-09-22, "Use AGENTS.md for managed agent instructions (#99043)")

### C3. AI 에게 커밋 시키기

- 주장: "Claude Code/Codex에게 '바뀐 파일 목록을 먼저 보여 주고, 문제 없으면 메시지로 커밋해 줘'라고 시켜도 된다 (AI가 git add/commit을 실행할 수 있다)."
- 판정: 맞음
- 설명: Anthropic 권장 흐름의 마지막 단계가 "Ask Claude to commit with a descriptive message and create a PR" 이고, Codex 문서도 결과를 받아들이기 전에 검토하고 diff 패널이나 `/review` 로 확인하라고 해요. 두 회사 모두 "커밋 전에 사람이 diff 와 검증 결과를 본다"는 단서를 달아요. Claude Code 는 manual 모드에서 커밋 전에 허락을 묻고, auto 모드에서는 분류 모델이 대신 검사해요.
- 보충 문구: "커밋 전에 `git diff` 로 바뀐 내용을 같이 보고, 테스트나 빌드가 통과했는지 확인한 뒤에 커밋하라고 시켜요. `.env.local` 같은 비밀 파일이 목록에 있으면 멈추게 해요."
- 출처:
  - https://code.claude.com/docs/en/best-practices ("Explore first, then plan, then code" 의 Commit 단계)
  - https://code.claude.com/docs/en/common-workflows ("Review Claude's generated PR before submitting")
  - https://learn.chatgpt.com/guides/best-practices (Codex best practices, 구 developers.openai.com/codex/learn/best-practices 에서 이동. "review the work before you accept it")

### C4. 긴 대화와 새 세션

- 주장: "대화가 길어지면 AI가 앞에서 정한 걸 잊는다. 결정을 docs/에 적고 새 세션에서 다시 시작하는 게 낫다."
- 판정: 맞음
- 설명: Anthropic 은 컨텍스트가 찰수록 "earlier instructions" 를 잊거나 실수가 늘 수 있다고 쓰고, 스펙을 파일로 남긴 뒤 새 세션에서 구현하라고 권해요. 다만 "항상 잊는다"는 아니에요: 자동 compaction 이 핵심 결정을 요약해 남기고, `/compact`, `/clear`, `/rewind` 같은 도구도 있어요. Codex 문서도 "한 작업 단위 = 한 대화"를 권하고 길어지면 `/compact` 를 쓰라고 해요.
- 보충 문구(표현 다듬기 권장): "대화가 길어지면 AI 가 앞에서 정한 걸 놓칠 수 있어요. 중요한 결정은 docs/ 에 적어 두고, 작업이 바뀌면 `/clear` 하거나 새 세션에서 그 파일을 읽히고 시작해요."
- 출처:
  - https://code.claude.com/docs/en/best-practices ("Manage context aggressively", "Let Claude interview you")
  - https://learn.chatgpt.com/guides/best-practices ("Keep one chat per coherent unit of work")

### C5. 계획 → 리뷰 → 실행 → 확인 → 커밋 루프

- 주장: "계획 → 리뷰 → 실행 → 확인 → 커밋 루프"
- 판정: 맞음 (공식 권장 흐름과 대체로 일치)
- 설명: Anthropic 공식 흐름은 Explore → Plan → Implement → Commit 이고, 구현 단계 안에 "테스트를 돌리고 실패를 고쳐라" 같은 검증을 넣으라고 해요. Codex 문서도 복잡한 일은 먼저 계획하고, 테스트·검사 후 결과를 검토하고 받아들이라고 해요. 차이는 두 가지예요: 공식 흐름은 맨 앞에 "탐색(코드 읽기)"이 있고, 한 문장으로 설명되는 작은 수정은 계획을 건너뛰라고 해요.
- 보충 문구: "맨 앞에 '먼저 관련 파일을 읽고 설명해 줘'(탐색)를 넣어요. 오타 수정처럼 한 줄로 설명되는 일은 계획 없이 바로 시켜도 돼요."
- 출처:
  - https://code.claude.com/docs/en/best-practices ("If you could describe the diff in one sentence, skip the plan")
  - https://learn.chatgpt.com/guides/best-practices

## OpenAI Codex

### C6. AGENTS.md 와 계획 먼저 받기

- 주장: "Codex는 AGENTS.md를 읽는다." / "Codex에서는 '계획부터 보여 줘'라고 하면 plan을 먼저 받을 수 있다"
- 판정: 부분적으로 맞음
- 설명: AGENTS.md 는 맞아요. `~/.codex/AGENTS.md` 와 프로젝트 루트부터 현재 폴더까지의 AGENTS.md 를 합쳐 읽어요(기본 32KiB 한도). 계획은 말로 부탁해도 되지만, Codex CLI 에는 정식 Plan 모드가 따로 있어요: `/plan` 또는 Shift+Tab("Change mode"). 이 Plan 모드는 "수정하는 행동을 하지 말라"는 지시로 동작하는 대화 모드이고, 쓰기를 시스템이 확실히 막으려면 `/permissions` 에서 Read Only 를 고르거나 `--sandbox read-only` 로 시작해야 해요.
- 수정 문구: "Codex 도 AGENTS.md 를 읽어요. 계획을 먼저 받으려면 `/plan` 을 치거나 Shift+Tab 으로 Plan 모드로 바꿔요. 파일이 절대 안 바뀌게 하고 싶으면 `/permissions` 에서 Read Only 를 골라요."
- 출처:
  - https://learn.chatgpt.com/docs/agent-configuration/agents-md (구 developers.openai.com/codex/guides/agents-md)
  - https://learn.chatgpt.com/guides/best-practices ("Toggle with `/plan` or Shift+Tab")
  - https://github.com/openai/codex/blob/main/codex-rs/tui/src/slash_command.rs (`/plan` "switch to Plan mode", `/permissions` "choose what Codex is allowed to do")
  - https://github.com/openai/codex/blob/main/codex-rs/collaboration-mode-templates/templates/plan.md ("You must not perform mutating actions")
  - https://github.com/openai/codex/blob/main/codex-rs/utils/approval-presets/src/lib.rs (Read Only / Default / Full Access 프리셋)

## 터미널 / OS 기초

### C7. 서버 끄기는 Ctrl+C

- 주장: "npm run dev를 끌 때 Mac도 Cmd+C가 아니라 Ctrl+C다." (macOS Terminal / iTerm / VS Code 통합 터미널)
- 판정: 맞음
- 설명: Apple 터미널 가이드는 실행 중인 명령을 끝낼 때 Control-C 를 누르라고 하고, Cmd+C 는 복사예요. VS Code 문서도 macOS 터미널에서 복사는 Cmd+C 라고 적어요. 덧붙여 macOS 기본 터미널 앱에선 Cmd+. 도 Ctrl+C 와 같은 효과예요.
- 출처:
  - https://support.apple.com/guide/terminal/execute-commands-and-run-tools-apdb66b5242-0d18-49fc-9c47-a2498b7c91d5/mac ("Press Control-C")
  - https://support.apple.com/guide/terminal/keyboard-shortcuts-trmlshtcts/mac ("Typing Command-Period (.) is equivalent to entering Control-C")
  - https://code.visualstudio.com/docs/terminal/basics (페이지 날짜 2026-10-07)

### C8. 위 화살표로 이전 명령

- 주장: "터미널에서 키보드 위 화살표를 누르면 방금 친 명령어가 다시 나온다" (macOS zsh, Windows PowerShell)
- 판정: 맞음
- 설명: zsh 의 기본 emacs 키맵에서 위 화살표(ESC-[A)는 `up-line-or-history` 에 묶여 있어요. PowerShell 의 PSReadLine 도 UpArrow 가 `PreviousHistory` 예요(Windows PowerShell 5.1 기본 포함). 계속 누르면 더 이전 명령으로 가요.
- 출처:
  - https://zsh.sourceforge.io/Doc/Release/Zsh-Line-Editor.html
  - https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_functions (ms.date 2026-01-18)

### C9. Finder 숨김 파일

- 주장: "Mac Finder에서 점(.)으로 시작하는 숨김 파일은 Cmd+Shift+. 을 눌러야 보인다."
- 판정: 맞음
- 설명: Cmd+Shift+. 은 Finder 에서 숨김 항목을 켜고 끄는 단축키예요. Apple 공식 단축키 페이지에는 이 항목이 없어서 2차 출처(Eclectic Light, 2024-07-03)로 확인했어요. `.DS_Store` 는 이 단축키로도 안 보이고, VS Code 탐색기는 `.env.local` 같은 점 파일을 기본으로 보여 줘요(기본 숨김은 .git, .DS_Store 등뿐).
- 보충 문구: "Finder 에서는 Cmd+Shift+. 을 누르면 숨김 파일이 보여요(다시 누르면 숨김). VS Code 왼쪽 파일 목록에서는 `.env.local` 이 원래 보여요."
- 출처:
  - https://eclecticlight.co/2024/07/03/how-to-hide-files-and-folders/ (2차 출처)
  - https://support.apple.com/en-us/102650 (Apple 단축키 페이지, 2026-09-14 게시. 해당 항목 없음 확인)
  - https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/files/browser/files.contribution.ts (`files.exclude` 기본값)

### C10. VS Code 터미널 위치

- 주장: "VS Code에서 파일 > 폴더 열기로 프로젝트를 열고 보기 > 터미널을 열면 그 폴더에서 터미널이 열린다."
- 판정: 맞음
- 설명: VS Code 문서에 "By default, the terminal will open at the folder that is opened in the Explorer" 라고 적혀 있고, 보기 > 터미널 또는 터미널 > 새 터미널로 열 수 있어요. 단축키는 Mac 이 Ctrl+`, Windows 도 Ctrl+` 예요. `terminal.integrated.cwd` 설정을 바꿨다면 그 경로에서 열려요.
- 출처: https://code.visualstudio.com/docs/terminal/basics (2026-10-07)

### C11. Windows 실행 정책 에러

- 주장: "Windows에서 npx 실행 시 'running scripts is disabled' 에러 → `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, 바꿀지 물어보면 Y"
- 판정: 부분적으로 맞음
- 설명: 명령 자체는 맞고 CurrentUser 범위라 관리자 권한도 필요 없어요. 다만 확인 질문("Execution Policy Change ... Do you want to change the execution policy?")은 Windows PowerShell 5.1(파란 기본 PowerShell)에서만 나오고 기본값이 N 이라 Y(또는 A)를 쳐야 해요. PowerShell 7(pwsh)은 소스상 이 질문을 띄우지 않고, 기본 정책이 이미 RemoteSigned 라서 보통 이 에러 자체가 잘 안 나요.
- 수정 문구: "`npx` 에서 'running scripts is disabled' 가 나오면 PowerShell 에 `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 를 입력해요. 바꿀지 물어보면 Y 를 치고 Enter 를 눌러요(안 물어보면 그냥 끝난 거예요). 그다음 터미널을 다시 열고 `npx` 를 다시 실행해요."
- 출처:
  - https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1 (ms.date 2026-08-31)
  - https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.5 (ms.date 2026-08-31)
  - https://github.com/PowerShell/PowerShell/blob/master/src/Microsoft.PowerShell.Security/security/ExecutionPolicyCommands.cs (`#if CORECLR` 에서는 ShouldProcess 만, 아니면 ShouldContinue 확인창)

### C12. git push 첫 인증

- 주장: "git push를 처음 하면 아이디/비밀번호를 물어볼 수 있는데, GitHub는 비밀번호 대신 브라우저 로그인이나 토큰을 쓴다."
- 판정: 맞음
- 설명: GitHub 는 Git 비밀번호 인증을 없앴고, 비밀번호를 물으면 개인 액세스 토큰(PAT)을 넣으라고 안내해요. 실제 화면은 환경마다 달라요: macOS 의 Apple(Xcode CLT)·Homebrew git 은 기본 credential helper 가 `osxkeychain` 이라 터미널에 Username/Password 를 묻고(이 Mac 에서 시스템 gitconfig 로 직접 확인), Windows 의 Git for Windows 는 Git Credential Manager 가 브라우저 로그인 창을 띄워요. GitHub 는 GitHub CLI(`gh auth login`)나 GCM 사용을 권장해요.
- 보충 문구: "처음 push 전에 `gh auth login` 을 한 번 해 두면 제일 쉬워요(HTTPS 선택, Git 인증 '예'). Mac 터미널이 Password 를 물으면 GitHub 비밀번호가 아니라 토큰을 넣어야 해요. VS Code 로 push 하면 브라우저 로그인 창이 떠요."
- 출처:
  - https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git
  - https://docs.github.com/en/get-started/git-basics/about-remote-repositories ("Password-based authentication for Git has been removed")
  - https://code.visualstudio.com/docs/sourcecontrol/github (2026-10-07, "When you clone a private repository or push to a GitHub repository, VS Code prompts you to sign in")

### C13. GitHub 새 저장소

- 주장: "GitHub 웹사이트 오른쪽 위 + 버튼에서 New repository를 만든다. README 체크는 끈다 (기본은 꺼져 있다)."
- 판정: 맞음 (기본값 부분은 확인 불가)
- 설명: 오른쪽 위 + 메뉴의 New repository 는 공식 문서와 같아요. 로컬 프로젝트를 올릴 거면 README, license, .gitignore 를 만들지 말라는 것도 공식 안내예요("To avoid errors"). README 옵션의 기본값이 꺼져 있다는 점은 공식 문서에 적혀 있지 않아 확인하지 못했어요.
- 보충 문구: "README, .gitignore, license 는 모두 꺼진 상태로 만들어요. 혹시 켜져 있으면 꺼요."
- 출처:
  - https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
  - https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github

## Supabase

### C14. 새 테이블 자동 노출 중단과 42501

- 주장: "2026년 5월 30일 이후 만든 Supabase 프로젝트는 새 테이블이 API(Data API)에 자동 노출되지 않는다. `grant select, insert, update, delete on public.specs to service_role;`가 없으면 42501 permission denied가 난다."
- 판정: 부분적으로 맞음
- 설명: 변경 자체는 사실이지만 "5/30 이후 프로젝트는 무조건"이 아니라 프로젝트 설정에 달려 있어요. 공식 변경 이력(2026-04-28 게시)에 따르면 프로젝트 생성 화면에 "Automatically expose new tables" 체크박스가 생겼고, 5월 30일부터 "꺼짐"이 새 프로젝트의 기본이 되었는데 "몇 주에 걸친 순차 적용"이었으며, 10월 30일에 기존 프로젝트 전체에 적용돼요. 이 설정이 켜져 있으면(생성 때 체크했거나 대시보드 Integrations > Data API 에서 켬) 예전처럼 anon, authenticated, service_role 에 select/insert/update/delete 가 자동으로 붙으므로, 2026-10-09 에 만든 프로젝트에서 권한이 자동으로 붙은 관찰과 모순되지 않아요.
- 정확한 설명:
  - 꺼진 프로젝트: 새 `public` 테이블에 권한이 없어서, Data API(supabase-js, PostgREST)로 접근하면 secret 키(service_role)도 `42501 permission denied for table` 이 나요. RLS 와는 별개예요(권한 = 테이블에 손댈 수 있나, RLS = 어떤 행을 볼 수 있나).
  - 켜진 프로젝트: 예전처럼 자동 권한이 붙어요.
  - 직접 Postgres 연결(psql, ORM)은 영향 없어요.
  - 어느 쪽인지 확인: SQL Editor 에서 `select grantee, privilege_type from information_schema.role_table_grants where table_schema = 'public' and table_name = 'specs';`
  - 왜 그 프로젝트는 자동으로 붙었는지(체크박스, 토글, 순차 적용 미대상 중 무엇인지)는 공식 문서로 가릴 수 없어요. 프로젝트 기본 권한은 `select pg_get_userbyid(defaclrole), defaclobjtype, defaclacl from pg_default_acl where defaclnamespace = 'public'::regnamespace;` 로 볼 수 있어요.
- 수정 문구: "2026년 5월 30일부터 새 Supabase 프로젝트는 '새 테이블 자동 노출(Automatically expose new tables)'이 꺼진 채로 만들어지는 게 기본이 됐어요(10월 30일부터는 기존 프로젝트도). 이 설정이 꺼져 있으면 테이블을 만든 뒤 권한을 직접 줘야 하고, 안 주면 secret 키로도 42501 permission denied 가 나요. 설정이 켜져 있으면 자동으로 붙지만, 어느 쪽이든 아래 grant 문을 테이블 만들 때 같이 실행해 두면 안전해요(이미 권한이 있어도 다시 실행해도 괜찮아요)."
- 출처:
  - https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically (2026-04-28)
  - https://github.com/orgs/supabase/discussions/45329 (관리자 답변 2026-05-20: "only applies to new projects created after May 30")
  - https://supabase.com/docs/guides/getting-started/quickstarts/nextjs ("enable **Automatically expose new tables**", Integrations > Data API)
  - https://supabase.com/docs/guides/api/securing-your-api
  - https://supabase.com/docs/guides/troubleshooting/database-api-42501-errors (권한 확인 쿼리)

### C15. RLS 정책 0개와 secret 키

- 주장: "RLS를 켜고 정책을 0개 두면 publishable(anon) 키로는 읽기/쓰기가 다 막히고, secret 키(service_role)는 RLS를 우회한다." + 새 `sb_secret_...` 키도 같은지
- 판정: 부분적으로 맞음
- 설명: 앞부분은 공식 문서 그대로예요("no data is accessible through the API when using a publishable key, until you create policies"). 새 `sb_secret_` 키도 레거시 service_role JWT 와 똑같이 `service_role` 역할(bypassrls)로 동작해요. 다만 두 조건이 붙어요: 요청에 로그인 사용자 토큰이 같이 실려 가면 우회하지 않고(공식 문구 "only when the request carries no user access token"), C14 처럼 테이블 GRANT 가 없으면 RLS 이전에 42501 로 막혀요.
- 수정 문구: "RLS 를 켜고 정책을 하나도 안 만들면 publishable 키로는 아무것도 읽고 쓸 수 없어요. secret 키(`sb_secret_...`, 예전 service_role 키도 같음)는 RLS 를 건너뛰지만, 로그인한 사용자 토큰을 같이 보내면 그 사용자 권한으로 바뀌고, 테이블 권한(GRANT)이 없으면 42501 이 나요. secret 키는 서버 코드에서만 써요(브라우저에서 쓰면 401)."
- 출처:
  - https://supabase.com/docs/guides/database/postgres/row-level-security
  - https://supabase.com/docs/guides/api/api-keys ("A secret key bypasses every Row Level Security policy", "A secret key doesn't work in a browser")

### C16. Project URL / secret key 위치

- 주장: "Project URL과 secret key는 Supabase 대시보드 Settings > API Keys에서 복사한다."
- 판정: 부분적으로 맞음
- 설명: 키(publishable, secret, 레거시 포함)는 모두 Settings > API Keys 에 있고, 공식 문서가 "there is no separate Settings > API page" 라고 해요. Project URL 은 공식 문서상 프로젝트 상단의 Connect 대화상자에서 복사하라고 안내해요(Connect 는 URL 과 publishable 키를 `.env` 형식으로 보여 줘요).
- 수정 문구: "Project URL 은 프로젝트 화면 위쪽 Connect 버튼을 눌러 복사하고, secret key 는 Settings > API Keys 의 Secret keys 에서 복사해요."
- 출처:
  - https://supabase.com/docs/guides/api/api-keys
  - https://supabase.com/docs/guides/getting-started/quickstarts/nextjs (Connect 패널 링크)

### C17. SQL Editor 성공 메시지

- 주장: "Supabase SQL Editor에서 실행하면 'Success. No rows returned'가 뜨면 성공."
- 판정: 맞음
- 설명: Supabase Studio 소스에 결과가 없는 성공 실행 시 이 문구를 그대로 띄우는 코드가 있어요. 마지막 문장이 select 처럼 행을 돌려주면 표가 나오는데 그것도 성공이고, 실패하면 `ERROR:` 로 시작하는 빨간 메시지가 나와요. 또 RLS 없는 테이블 생성, drop 같은 위험 작업, where 없는 update 가 있으면 실행 전에 "Potential issue detected" 확인창이 먼저 떠요.
- 보충 문구: "'Success. No rows returned' 나 결과 표가 나오면 성공이에요. 'Potential issue detected' 창이 뜨면 내용을 읽고, 의도한 거면 실행을 눌러요."
- 출처:
  - https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/UtilityPanel/UtilityTabResults.tsx
  - https://github.com/supabase/supabase/blob/master/apps/studio/components/interfaces/SQLEditor/RunQueryWarningModal.tsx

## Next.js 16

### C18. create-next-app `--yes`

- 주장: "`npx create-next-app@latest <name> --yes`는 TypeScript, Tailwind, App Router 기본값으로 만들고 git init과 첫 커밋까지 한다. AGENTS.md(AI용 규칙 파일)도 같이 만든다."
- 판정: 부분적으로 맞음
- 설명: 16.4.0 소스의 기본값은 TypeScript, ESLint, Tailwind, App Router, src 폴더 없음, `@/*` alias, React Compiler 끔, Cache Components 켬, AGENTS.md 켬이에요(AGENTS.md 는 16.2.0 부터). 단 `--yes` 는 "저장된 이전 선택이 있으면 그걸, 없으면 기본값"이라 이전에 다른 선택을 했던 컴퓨터에선 결과가 달라질 수 있어요. git 은 조건부예요: git 이 없거나, 이미 다른 git 저장소 안의 폴더이거나, 첫 커밋이 실패하면(예: `user.name`/`user.email` 미설정) 아무 메시지 없이 `.git` 을 지우고 넘어가요.
- 수정 문구: "`npx create-next-app@latest 이름 --yes` 는 TypeScript, Tailwind, App Router 로 프로젝트를 만들고 AGENTS.md 도 만들어요. git 이 설치돼 있고 이름·이메일 설정(`git config --global user.name`, `user.email`)이 돼 있으면 첫 커밋까지 해 줘요. 끝나고 `git log --oneline` 에 'Initial commit from Create Next App' 이 보이는지 확인해요."
- 출처:
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/index.ts (`defaults`, `--yes` = "Use saved preferences or defaults")
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/helpers/git.ts
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/helpers/generate-agent-files.ts
  - npm `create-next-app` latest = 16.4.0 (2026-10-06 게시, `npm view` 로 확인)

### C19. cacheComponents 기본값과 Suspense

- 주장: "create-next-app이 next.config.ts에 cacheComponents: true를 켜 둔다. params나 요청 시점 데이터를 읽는 페이지는 <Suspense>로 감싸야 build가 통과한다 ('Uncached data was accessed outside of <Suspense>')."
- 판정: 부분적으로 맞음
- 설명: create-next-app 16.4.0(2026-10-06)부터만 맞아요. 이 버전이 `cacheComponents: true` 와 `partialPrefetching: true` 두 줄을 넣고, 16.3 이하로 만든 프로젝트엔 없어요. 에러 범위도 더 넓어요: `params`/`searchParams` await, `cookies()`/`headers()` 뿐 아니라 `"use cache"` 없이 DB(Supabase 포함)나 fetch 를 기다리는 컴포넌트도 걸리고, 해결법은 `<Suspense>` 외에 `loading.js` 추가, `"use cache"`, `generateStaticParams` 도 있어요. dev 에선 오류 오버레이로, build 에선 실패로 나타나요.
- 수정 문구: "Next 16.4 부터 create-next-app 은 next.config.ts 에 `cacheComponents: true` 를 켜 둬요. 이때 페이지가 params 나 쿠키를 읽거나 캐시 안 한 데이터(Supabase 조회 등)를 기다리면 'Uncached data was accessed outside of `<Suspense>`' 로 빌드가 실패해요. 그 부분을 `<Suspense>` 로 감싸거나, 그 폴더에 `loading.tsx` 를 추가해요."
- 출처:
  - https://nextjs.org/blog/next-16-4 (2026-10-06, "all new apps created with `create-next-app` will have Cache Components enabled by default")
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/templates/index.ts (`cacheComponents: true, partialPrefetching: true` 삽입)
  - https://nextjs.org/docs/messages/blocking-route

### C20. .env.local 수정 후 재시작

- 주장: ".env.local을 고친 다음에는 Ctrl+C → npm run dev로 다시 켜야 반영된다."
- 판정: 틀림 (Next 16 의 `next dev` 기준)
- 설명: `next dev` 는 `.env.development.local`, `.env.local`, `.env.development`, `.env` 를 감시하다가 바뀌면 다시 읽고 터미널에 `Reload env: .env.local` 을 찍어요. `NEXT_PUBLIC_` 값의 번들 치환도 새 값으로 갱신되고, Next.js 테스트 코드가 재시작 없이 새 값이 화면에 반영되는 걸 검증해요. 공식 환경변수 문서에는 이 자동 재로드가 적혀 있지 않아 소스와 테스트로 확인했어요. 프로덕션(`next build` 후 `next start`)은 다시 빌드해야 해요.
- 수정 문구: "`npm run dev` 가 켜진 상태에서 `.env.local` 을 저장하면 보통 자동으로 다시 읽어요. 터미널에 `Reload env: .env.local` 이 뜨면 반영된 거예요. 그래도 값이 안 바뀌어 보이면 브라우저를 새로고침하고, 그래도 안 되면 Ctrl+C 후 `npm run dev` 로 다시 켜요."
- 출처:
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/next/src/server/lib/router-utils/setup-dev-bundler.ts (`envFiles` 감시, `loadEnvConfig` forceReload)
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/next/src/server/next-server.ts (`Reload env:` 로그)
  - https://github.com/vercel/next.js/blob/v16.4.0/test/development/app-hmr/hmr.test.ts (재시작 없이 새 값 반영 테스트)
  - https://nextjs.org/docs/app/guides/environment-variables (version 16.4.0, lastUpdated 2026-08-25)

### C21. NEXT_PUBLIC_ 규칙

- 주장: "NEXT_PUBLIC_이 붙은 변수만 브라우저 번들에 들어간다."
- 판정: 맞음
- 설명: `.env` 파일과 환경변수 기준으로 정확해요. 공식 문서는 NEXT_PUBLIC_ 이 아닌 변수는 Node.js 쪽에서만 쓸 수 있고, NEXT_PUBLIC_ 값은 빌드 때 번들에 그대로 박힌다고 해요. 예외는 두 가지예요: `next.config` 의 레거시 `env` 옵션에 넣은 값은 이름과 상관없이 항상 번들에 들어가고, 서버 컴포넌트가 비밀 값을 클라이언트 컴포넌트에 props 로 넘기면 브라우저로 가요.
- 보충 문구: "비밀 키에는 NEXT_PUBLIC_ 을 절대 붙이지 마세요. NEXT_PUBLIC_ 값은 누구나 브라우저에서 볼 수 있어요."
- 출처:
  - https://nextjs.org/docs/app/guides/environment-variables
  - https://nextjs.org/docs/app/api-reference/config/next-config-js/env ("This is a legacy API", "will **always** be included in the JavaScript bundle")

## OpenAI

### C22. Responses API 구조화 출력

- 주장: "OpenAI Responses API 구조화 출력은 text.format = { type: 'json_schema', name, strict: true, schema }이고, strict이면 모든 object에 additionalProperties:false, 모든 속성을 required에 넣어야 하며 어기면 400."
- 판정: 맞음
- 설명: API 레퍼런스상 `name`, `schema`, `type` 이 필수이고 `strict`, `description` 은 선택이에요(`name` 은 영문·숫자·`_`·`-` 로 64자 이내). 가이드에 "all fields ... must be specified as `required`", `additionalProperties: false` 필수, 선택 필드는 `null` 과의 union 으로 흉내 내라고 적혀 있어요. 가이드는 어기면 "you will receive an error" 라고만 하고 상태 코드는 안 적지만, 공식 SDK 에서 이 오류는 400 BadRequestError 로 와요.
- 보충 문구: "있어도 되고 없어도 되는 값은 `"type": ["string", "null"]` 처럼 null 을 허용하고, required 에는 그대로 넣어요."
- 출처:
  - https://developers.openai.com/api/docs/guides/structured-outputs
  - https://developers.openai.com/api/reference/resources/responses/methods/create (`ResponseFormatTextJSONSchemaConfig`)
  - https://github.com/openai/openai-node/blob/master/src/core/error.ts (status 400 → BadRequestError)

### C23. 모델 ID

- 주장: "모델 gpt-6-luna를 기본으로 쓰고, 404 모델 없음이면 gpt-5.4-mini로 바꾼다."
- 판정: 맞음
- 설명: 두 ID 모두 오늘 기준 공식 모델 페이지가 있고 Responses API 와 Structured Outputs 를 지원해요. gpt-6-luna 는 공식 모델 목록에서 "high-volume, cost-sensitive work" 용 플래그십이고, gpt-5.4-mini 는 스냅샷 `gpt-5.4-mini-2026-03-17` 의 이전 세대 모델이에요(폐기 표시 없음). 404 는 모델명 오타나 프로젝트의 모델 접근 권한 때문에도 날 수 있어요.
- 출처:
  - https://developers.openai.com/api/docs/models
  - https://developers.openai.com/api/docs/models/gpt-6-luna
  - https://developers.openai.com/api/docs/models/gpt-5.4-mini

## 디자인

### C24. Pretendard 자간과 줄바꿈

- 주장: "Pretendard로 한글을 쓸 때 본문 자간은 약 -0.01em~-0.025em, 큰 제목은 -0.03em~-0.04em 정도로 줄이고, word-break: keep-all을 쓴다."
- 판정: 부분적으로 맞음
- 설명: `word-break: keep-all` 은 맞아요. CSS 명세가 띄어쓰기로 단어를 나누는 한국어에 흔한 방식이라고 설명해요. 음수 자간은 공식 권장이 아니에요: Pretendard 공식 README 는 자간 등을 따로 조정하지 않아도 가독성이 확보된다고 하고, W3C 한글 조판 요구사항(klreq)도 한글 글자사이 기본을 0 으로 봐요. 큰 제목을 조금 좁히는 건 흔한 관행이고, Pretendard 라틴 글자의 바탕인 Inter 의 공식 공식(구 v3 문서)으로 계산하면 16px 약 -0.011em, 24px 약 -0.019em, 32px 이상 약 -0.022em 이라 -0.03~-0.04em 은 꽤 강한 편이에요.
- 권장 수치(출처 기반):
  - 본문 자간: 0 (좁히고 싶어도 -0.01em 정도까지). 근거: Pretendard README, klreq 7.3.1.
  - 제목 자간: -0.01em ~ -0.02em, 아주 큰 디스플레이 제목만 화면 보며 -0.03em 까지. 근거: Inter dynamic metrics.
  - 본문 줄 간격: 1.5 ~ 1.7 (기본 1.6 권장). 근거: WCAG 1.4.8(AAA) "at least space-and-a-half", klreq 예시 160%.
  - 줄바꿈: `word-break: keep-all` (긴 URL 대비 `overflow-wrap: anywhere` 같이 쓰기).
- 수정 문구: "Pretendard 는 본문 자간을 따로 줄이지 않아도 돼요(0, 줄여도 -0.01em 정도). 큰 제목만 -0.01~-0.02em 정도 살짝 좁혀요. 본문 줄 간격은 1.6 정도가 읽기 편하고, 한글이 단어 중간에서 끊기지 않게 `word-break: keep-all` 을 써요."
- 출처:
  - https://github.com/orioncactus/pretendard (README, 최신 릴리스 v1.3.9: "without requiring further adjustments of scaling, letter-spacing, optical adjustments")
  - https://www.w3.org/TR/klreq/ (W3C Group Note Draft 2026-03-21, 7.3.1 "글자사이 0으로 배열하는 것을 기본", 7.4.1 160% 예시)
  - https://www.w3.org/TR/css-text-3/ (`keep-all`: "the other common behavior for Korean")
  - https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html (1.4.8, AAA)
  - https://d.rsms.me/inter-website/v3/dynmetrics/ (Inter 공식 사이트 보관본, tracking = -0.0223 + 0.185 × e^(-0.1745 × size))

### C25. 큰 라운드 값과 중첩 radius 규칙

- 주장: "Apple식 큰 라운드(예: 28/20/14px)와 '안쪽 radius = 바깥 radius - padding' 규칙."
- 판정: 부분적으로 맞음
- 설명: 중첩 규칙은 Apple 공식 자료에 있어요. WWDC23 은 "안쪽 요소 radius + 사이 padding = 바깥 radius" 공식과 함께 continuous corner 를 쓰라고 하고, WWDC25 새 디자인 시스템도 "concentric shapes calculate their radius by subtracting padding from the parent's" 라고 해요. 하지만 28/20/14px 같은 값은 Apple 이 정한 수치가 아니라 예시예요. padding 이 바깥 radius 보다 크면 계산값이 0 이하가 되니 최소값을 두고, 웹 `border-radius` 는 Apple 의 연속 곡선과 다르며 이를 흉내 내는 `corner-shape: squircle` 은 아직 일부 브라우저만 지원해요.
- 수정 문구: "카드 안에 또 둥근 상자를 넣을 때는 안쪽 radius = 바깥 radius - 사이 여백으로 맞추면 모서리가 나란해 보여요(Apple 이 권하는 방법). 여백이 radius 보다 크면 안쪽은 작은 최소값(예: 8px)을 써요. 28/20/14px 은 예시 값이에요."
- 출처:
  - https://developer.apple.com/videos/play/wwdc2023/10076/ (Design for spatial user interfaces, 2023)
  - https://developer.apple.com/videos/play/wwdc2025/356/ (Get to know the new design system, 2025)
  - https://developer.apple.com/documentation/swiftui/concentricrectangle
  - https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape (2026-08-27 수정, "Limited availability")

### C26. getdesign CLI 와 DESIGN.md

- 주장: "`npx getdesign add <brand> --out docs/DESIGN-ref.md`로 브랜드 DESIGN.md를 받는다" / "DESIGN.md는 Google Stitch 표준 형식이다."
- 판정: 부분적으로 맞음
- 설명: 명령 형식은 맞아요. getdesign(npm 0.6.25, VoltAgent/awesome-design-md)은 `add <slug>` 와 `--out <path>` 를 지원하고 `--out` 이 없으면 루트에 DESIGN.md 를 써요. 하지만 받는 파일은 브랜드 공식 디자인 시스템이 아니라 README 표현대로 "inspiration files, not official design systems" 예요. DESIGN.md 는 Google Stitch 에서 나온 형식이고 Google Labs 가 Apache-2.0 명세로 공개했지만, 현재 버전이 `alpha` 라 "표준"보다는 "공개 초안 명세"가 정확해요.
- 수정 문구: "`npx getdesign add <slug> --out docs/DESIGN-ref.md` 로 브랜드 느낌을 참고해 만든 DESIGN.md 를 받을 수 있어요(브랜드 공식 파일은 아니에요). slug 는 `npx getdesign list` 로 확인해요. DESIGN.md 는 Google Stitch 에서 시작해 Google Labs 가 공개한 형식이고, 아직 alpha 버전이에요."
- 출처:
  - https://www.npmjs.com/package/getdesign (README, 0.6.25, 2026-08-29 갱신)
  - https://github.com/VoltAgent/awesome-design-md (README: "Every file follows the Stitch DESIGN.md format with extended sections")
  - https://github.com/google-labs-code/design.md (README: "The DESIGN.md format is at version `alpha`", Apache-2.0)

## 추가 주장 (C27~C29)

### C27. create-next-app 의 브랜치 이름

- 주장: "npx create-next-app@latest (Next 16) runs git init and makes the first commit on a branch named main, so `git push -u origin main` works right after `git remote add origin ...`."
- 판정: 부분적으로 맞음
- 설명: 소스상 `git init` 뒤에 `git config init.defaultBranch` 가 설정돼 있지 않을 때만 `git checkout -b main` 을 해요. 그래서 init.defaultBranch 가 없으면 main, 있으면 그 값(예: master)을 따르고, master 면 `git push -u origin main` 이 "src refspec main does not match any" 로 실패해요. Apple Xcode 도구의 git 은 시스템 설정에 `init.defaultBranch = main` 이 들어 있어서(이 Mac 에서 확인) Mac 은 대부분 main 이고, `git checkout -b main` 은 오래된 git 에서도 동작해요. 그리고 C18 처럼 첫 커밋이 실패하거나 이미 git 저장소 안이면 저장소 자체가 안 만들어져요.
- 수정 문구: "create-next-app 은 보통 main 브랜치에 첫 커밋을 만들어 줘요. push 전에 `git branch --show-current` 로 main 인지 확인하고, 아니면 `git branch -M main` 을 먼저 실행해요."
- 출처:
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/helpers/git.ts (`isDefaultBranchSet`, `git checkout -b main`)
  - 로컬 확인: `/Library/Developer/CommandLineTools/usr/share/git-core/gitconfig` 에 `[init] defaultBranch = main`, `[credential] helper = osxkeychain`

### C28. 빈 저장소의 push 안내

- 주장: "When you create an empty repository on GitHub (no README), the page shows the 'push an existing repository from the command line' commands: git remote add origin ..., git branch -M main, git push -u origin main."
- 판정: 맞음 (페이지 문구 자체는 2차 출처로 확인)
- 설명: 공식 문서는 빈 저장소를 만들면 Quick Setup 페이지가 나오고, 거기서 원격 URL 을 복사해 `git remote add origin REMOTE-URL` → `git push -u origin main` 을 하라고 안내해요. Quick Setup 화면에 적힌 정확한 3줄(`git branch -M main` 포함)은 공식 문서에 실려 있지 않아 여러 2차 자료로 확인했어요. `git branch -M main` 은 현재 브랜치 이름을 main 으로 바꾸는 명령이라, 이미 main 이면 아무 일도 안 일어나고 master 일 때 C27 문제를 막아 줘요.
- 출처:
  - https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github ("Quick Setup page", `git remote add origin REMOTE-URL`, `git push -u origin main`)
  - https://dev.to/jhutanda/fail-to-push-code-existing-repo-code-in-the-github-main-branch-313m (2차 출처, 3줄 순서)

### C29. README 가 있는 폴더에서 create-next-app

- 주장: "If you create the GitHub repo first with a README and clone it, then run create-next-app inside that folder, create-next-app refuses because the folder is not empty (README.md conflicts)." + `.git` 만 있으면 `npx create-next-app@latest .` 가 되는지
- 판정: 맞음
- 설명: create-next-app 은 허용 목록에 없는 파일이 있으면 "contains files that could conflict" 를 출력하고 멈춰요. 허용 목록에 `.git`, `.gitignore`, `LICENSE`, `docs`, `.vscode`, `.idea`, `.DS_Store`, `.claude`, `.cursor` 등은 있지만 `README.md` 는 없어요. 그래서 `.git` 만 있는 clone 폴더에선 `npx create-next-app@latest .` 가 동작하지만, 두 가지를 알아야 해요: 폴더 이름이 npm 이름 규칙(소문자, URL 에 쓸 수 있는 문자)을 어기면(예: `MyApp`, 한글 이름) 거부되고, 이미 git 저장소 안이라 git init 과 첫 커밋을 건너뛰어요.
- 보충 문구: "GitHub 에서 README 를 켜고 만든 저장소를 clone 하면 create-next-app 이 README.md 때문에 멈춰요. 저장소를 빈 상태로 만들거나, 아래 '로컬 먼저' 순서를 따라요."
- 출처:
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/helpers/is-folder-empty.ts
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/index.ts (`validateNpmName(basename(appPath))`)
  - https://github.com/vercel/next.js/blob/v16.4.0/packages/create-next-app/helpers/git.ts (`isInGitRepository()` 면 init 생략)

### 초보자에게 가장 단순한 흐름 (공식 문서 기준)

- 결론: create-next-app 을 쓰는 경우엔 "로컬에서 먼저 만들고, GitHub 에 빈 저장소를 만든 뒤 push" 가 가장 단순해요. create-next-app 이 git 저장소와 첫 커밋을 이미 만들고, README.md 가 있는 폴더는 거부하기 때문이에요. GitHub 공식 문서도 로컬 코드를 올릴 때 "To avoid errors, do not initialize the new repository with README, license, or gitignore files" 라고 안내해요.
- 순서(해요체):
  1. `npx create-next-app@latest 이름 --yes` 로 만들고 `git log --oneline` 으로 첫 커밋을 확인해요.
  2. GitHub 에서 + > New repository 로, README/.gitignore/license 를 모두 끈 채 만들어요.
  3. Quick Setup 화면의 URL 로 `git remote add origin URL` → `git branch -M main` → `git push -u origin main` 을 실행해요.
- 더 짧은 대안: `gh auth login` 을 해 둔 상태라면 프로젝트 폴더에서 `gh repo create 이름 --private --source=. --push` 한 줄로 저장소 생성과 push 를 같이 할 수 있어요. GitHub Desktop 의 Publish repository 도 공식 대안이에요.
- 출처:
  - https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github ("you can use GitHub CLI or GitHub Desktop", `gh repo create --source=. --public`)
  - https://cli.github.com/manual/gh_repo_create (`--source`, `--push`)
