# NEXT 개발 세션 8: 바이브 코딩으로 끝까지 만들기

오늘 만드는 것: **PRD 메이커**. 아이디어 한 줄 넣으면 AI가 해커톤용 PRD를 뽑아 주고, Supabase에 저장해 두는 웹 서비스예요.
빈 폴더에서 시작해서 레포 생성, 기획 문서, OpenAI 연결, Supabase 연결까지 직접 해 봐요.

## 이 팩에 든 것

| 파일 | 역할 |
|---|---|
| `docs/PRD.md` | 무엇을 만드나. 8번 "내 버전"은 각자 채우기 |
| `docs/DESIGN.md` | 어떻게 보이나. 프리셋 하나 고르기 |
| `docs/API.md` | 어떻게 동작하나. 구조, API, DB, AI 호출, 외부 의존성 |
| `docs/PROMPTS.md` | Step별로 AI에게 보낼 프롬프트와 확인 방법 |
| `AGENTS.append.md` | AI가 지킬 규칙. 프로젝트의 `AGENTS.md` 맨 아래에 붙이기 |
| `CLAUDE.md` | Claude Code가 `AGENTS.md`를 읽게 하는 한 줄 |
| `supabase/schema.sql` | 테이블 생성 SQL |
| `env.example` | 환경변수 틀 |

## 1. 레포 만들기

macOS 터미널 / Windows PowerShell 명령어 동일:

```bash
npx create-next-app@latest prd-maker --yes
cd prd-maker
npm install openai @supabase/supabase-js
npm run dev
```

- `--yes`: TypeScript, Tailwind, App Router 기본값으로 바로 만들어요. git이 설치돼 있고 이름·이메일 설정(`git config --global user.name "이름"`, `git config --global user.email "이메일"`)이 돼 있으면 첫 커밋까지 해 줘요. 끝나고 `git log --oneline`에 Initial commit이 보이는지 확인해요.
- localhost:3000에 Next 기본 화면이 뜨면 성공. 확인했으면 `Ctrl+C`로 끄기.
- Windows에서 `running scripts is disabled` 에러가 나면 아래 한 줄 입력 후 다시 실행:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 2. 문서팩 넣기

압축 푼 위치가 다르면 첫 줄 경로만 바꾸기.

macOS 터미널:

```bash
P=~/Downloads/prd-maker-pack
cp -R $P/docs $P/supabase .
cp $P/CLAUDE.md $P/env.example .
cat $P/AGENTS.append.md >> AGENTS.md
cp env.example .env.local
```

Windows PowerShell:

```powershell
$P = "$HOME\Downloads\prd-maker-pack"
Copy-Item -Recurse "$P\docs", "$P\supabase" .
Copy-Item "$P\CLAUDE.md", "$P\env.example" .
Get-Content "$P\AGENTS.append.md" -Encoding utf8 |
  Add-Content AGENTS.md -Encoding utf8
Copy-Item env.example .env.local
```

`AGENTS.md` 위쪽의 Next.js 블록은 지우지 않기. `next dev`가 다시 써 넣는 영역이고, 우리 규칙은 그 아래에 붙어요.

## 3. GitHub에 올리기

GitHub 웹에서 New repository로 `prd-maker`를 먼저 만들어요 (README 체크 해제). 그다음 Mac, Windows 동일:

```bash
git add .
git commit -m "docs: add session pack"
git remote add origin https://github.com/<내 아이디>/prd-maker.git
git push -u origin main
```

`.env.local`은 `.gitignore`에 이미 들어 있어서 올라가지 않아요.

## 4. 기획 문서 채우기

- `docs/PRD.md` 8번 "내 버전" 4칸 중 2칸 이상 채우기
- `docs/DESIGN.md` 8번에 프리셋 고르기
- 커밋:

```bash
git commit -am "docs: my version"
```

## 5. AI로 만들기

`claude` 또는 `codex` 실행 후 `docs/PROMPTS.md`의 Step 0 → 1 → 2 → 3 → 4 순서대로.
Step마다: 프롬프트 → 직접 확인 → 이해 질문 → 커밋.

`npm run dev`가 켜진 상태에서 `.env.local`을 저장하면 보통 자동으로 다시 읽어요(터미널에 `Reload env: .env.local`이 떠요). 값이 안 바뀐 것 같으면 브라우저를 새로고침하고, 그래도 안 되면 `Ctrl+C` → `npm run dev`로 다시 켜요.

## 막히면

1. `docs/PROMPTS.md` 맨 아래 "막혔을 때 쓰는 프롬프트"
2. 그래도 안 되면 손 들어 주세요. 에러 메시지는 화면과 터미널 둘 다 준비.
3. 세션 안에 안 풀리면 운영진이 기록해 두고 끝나고 같이 봐요. 혼자 10분 넘게 붙잡지 않기.

## 과제 (10/26 월요일 세션 전까지)

- [ ] Vercel 배포: Environment Variables에 `OPENAI_API_KEY`, `OPENAI_MODEL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` 등록 후 Redeploy
- [ ] P1 기능 하나 더 (마크다운 복사, 상세/삭제)
