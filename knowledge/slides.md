# Session 8 발표 자료: 바이브 코딩으로 끝까지 만들기

NEXT 15기 개발세션 8. 2026-10-11(일), 1시간. 학회원 약 17명, 개발팀 운영진 3명이 돌아다니며 도와준다.

## 오늘 할 것 (60분)

- 01 오프닝 5분: 오늘 만들 것과 왜 만드는지
- 02 큰 그림 5분: 코드가 어디서 어디로 흐르는지
- 03 실습 40분: 빈 폴더에서 레포 만들고 GitHub push까지
- 04 데모·과제 10분: 2~3명 시연, 해커톤 전 과제
- 오늘의 목표: 버튼 하나 누르면 어떤 코드가 어떤 순서로 도는지 말로 설명할 수 있게 되기

## 지난 세션 vs 오늘

- 지난 세션(Session 7): 다 만들어진 레포에서 프롬프트만 바꿨다. 완성된 레포 Fork & Clone, character.ts 프롬프트 수정, Vercel 배포.
- 오늘(Session 8): 빈 폴더에서 레포부터 끝까지 만든다. create-next-app으로 레포 생성, PRD·DESIGN·API 문서 작성, Claude Code / Codex로 Step별 구현, OpenAI + Supabase 직접 연결 후 push.
- 코드는 AI가 쓴다. 뭘 만들지 정하고, 제대로 됐는지 확인하는 건 우리 몫이다.

## 왜 이걸 만드나

- 10/11(일) 오늘: PRD를 손으로 써 보고, PRD 써 주는 서비스를 직접 만들기
- 10/28(수) 과제 마감: Vercel 배포까지 끝내서 언제든 쓸 수 있게 하기
- 10/31(토) 연합 해커톤: 내가 만든 PRD 메이커로 PRD 뽑고 바로 바이브 코딩 시작
- 해커톤 첫 2~3시간을 기획 회의로 날리지 않기. PRD가 먼저 있어야 AI도 제대로 만든다.

## 오늘 만들 것: PRD 메이커

아이디어 한 줄 넣으면 해커톤용 PRD가 나온다.
1. 입력: 아이디어 이름, 해결할 문제, 타깃, 개발 기간
2. AI 생성: 핵심 기능(P0/P1), 화면, 데이터 모델, API, 바이브 코딩 첫 프롬프트
3. 저장: Supabase에 쌓이고, 목록에서 다시 보고, 마크다운으로 복사
(예시 화면: "팀메이트, 24시간 안에 나랑 맞는 팀원 찾기" 같은 결과 카드)

## 큰 그림: 키는 서버 밖으로 나가지 않아요

- 브라우저 (누구나 개발자도구로 열어볼 수 있음): `app/page.tsx` 입력 폼과 결과 카드 표시, `app/specs/page.tsx` 목록 화면
- Next.js 서버 (코드와 키가 사용자에게 안 보임): `app/api/specs/route.ts`
  - POST: 입력 검증 → `generateSpec()` (lib/openai.ts) → insert (lib/supabase.ts) → spec JSON 응답
  - GET: 최신순 목록 조회
  - `.env.local`의 `OPENAI_API_KEY`, `SUPABASE_SECRET_KEY`는 서버 코드만 읽는다
- 외부 서비스 (키가 있어야 응답): OpenAI(PRD를 JSON으로 생성), Supabase(specs 테이블)
- 흐름: ① 폼 입력을 fetch로 POST /api/specs에 보낸다 ② 서버가 프롬프트 + JSON Schema를 OpenAI에 보내고 PRD JSON을 받는다 ③ 서버가 결과를 Supabase specs 테이블에 저장한다 ④ 서버가 spec JSON을 돌려주고, 브라우저가 카드로 그린다

## 키는 어디에 두나 (Session 6에서 본 표에 "서버" 칸이 생겼다)

| 키 | 생김새 | 브라우저 코드 | 서버 코드(route.ts) | 오늘 쓰나 (.env.local 이름) |
|---|---|---|---|---|
| Project URL | https://xxxx.supabase.co | O | O | SUPABASE_URL |
| Publishable key | sb_publishable_... | O | O | 안 씀 |
| Secret key | sb_secret_... | X 절대 | O | SUPABASE_SECRET_KEY |
| OpenAI API key | sk-... | X 절대 | O | OPENAI_API_KEY |

- `NEXT_PUBLIC_`이 붙은 변수만 브라우저로 나간다. 오늘은 `NEXT_PUBLIC_` 쓸 일이 없다.
- Secret key는 RLS를 무시하는 마스터키다. 그래서 서버 코드 안에서만 쓴다.

## AI한테 맡길 것 vs 내가 정할 것

- 내가 정할 것: 핵심 구조(데이터 모델, API 경계, 어떤 파일이 무슨 일을 하는지), 돈·권한이 걸린 로직(결제, 인증, 구독), 비즈니스 판단(타깃, 가격, 뭘 먼저 만들지)
- AI한테 맡길 것: 정해진 구조 안의 구현(화면, API 코드, 연결 코드), 에러 원인 찾기(원인부터 설명시키고 최소 수정), 반복 작업과 점검(보안 기본 조치, 리팩터링 후보 찾기)
- 사일런트 페일: 에러는 안 나는데 조용히 틀리는 것. 이게 제일 무섭다. 그래서 오늘은 Step마다 눈으로 확인한다.
- 오늘 앱의 핵심 구조는 docs/API.md에 미리 정해 뒀다. 그래서 AI가 덜 헤맨다.

## 바이브 코딩 루프

1 문서 확인(docs/에 적힌 대로만) → 2 프롬프트(Step 하나씩만 시키기) → 3 직접 확인(브라우저, 터미널, Supabase를 눈으로) → 4 이해 질문(방금 코드가 어떤 순서로 도는지 AI한테 묻기) → 5 git commit(되돌릴 지점 만들기) → 다음 Step

지난 연사 세션에서 들은 것:
- docs 폴더부터: 기능별로 결정한 걸 docs/에 문서로 깔아 두고, AI가 코드를 뒤지기 전에 문서부터 읽게 한다. 맥락이 덜 오염되고 토큰도 아낄 수 있다.
- 언제든 되돌릴 수 있게: 기능 단위로 커밋을 미리미리 찍어 둔다. AI가 망쳐도 커밋으로 바로 돌아가면 된다.

## 문서팩: AI가 읽고 만드는 기준

- `docs/PRD.md` 무엇을 만드나. 8번 "내 버전"은 각자 채우기
- `docs/DESIGN.md` 어떻게 보이나. 프리셋 3개 중 하나 고르기
- `docs/API.md` 어떻게 동작하나. 구조, API, DB, AI 호출, 의존성
- `docs/PROMPTS.md` Step별로 AI한테 보낼 말. 확인 방법, 이해 질문 포함
- `AGENTS.md` AI가 지킬 규칙. 한 Step만, 키는 서버에만, 패키지 추가 금지
- `supabase/schema.sql` specs 테이블. RLS와 grant까지 들어 있음
- 문서가 기준이다. AI가 문서랑 다르게 만들면 코드 말고 문서대로 고쳐 달라고 한다.

## 실습 40분, 이렇게 진행해요

시간표: 0:10 레포 만들기(7분) · 0:17 기획(6분) · 0:23 Step 0(2분) · 0:25 Step 1(6분) · 0:31 Step 2(8분) · 0:39 Step 3(8분) · 0:47 Step 4(5분) · 0:52 데모

1. 막히면 손 들기: 개발팀이 와서 같이 본다. AI한테 보낼 말을 같이 만들어 준다.
2. 혼자 10분 넘게 붙잡지 않기: 안 풀리면 옆 사람 화면 보면서 다음 Step으로 같이 간다. 남은 건 세션 끝나고 개발팀이 따로 봐 준다.
3. Step마다 커밋하기: git log에 Step 커밋이 쌓이는 게 오늘 끝까지 갔다는 증거다. 되돌릴 지점이기도 하다.

## 실습은 이 노트를 켜 놓고 진행해요 (Session 8 실습 노트, 링크는 잡담방 공지)

- Step마다 체크리스트: 계획 받기 → 계획에 질문하거나 고치기 → 직접 확인 → 커밋
- 내 말로 답하기: Step마다 질문 2개. AI가 쓴 코드를 내가 설명할 수 있는지 확인한다
- AI 튜터: 오늘 세션 내용을 다 알고 있다. 답을 보고 피드백과 다음 질문을 준다. 코드는 안 준다. 로그인 없이 링크만 열면 쓸 수 있다
- 막혔어요 · 제출: 막히면 버튼 누르고 손 들기. 끝나면 회고에서 제출 요약 복사해서 잡담방에

## 1. 레포 만들기 (실습 0:10)

macOS 터미널 / Windows PowerShell (명령어 동일):
```
npx create-next-app@latest prd-maker --yes
cd prd-maker
npm install openai @supabase/supabase-js
npm run dev
```
- `--yes`: TypeScript, Tailwind, App Router 기본값으로 바로 만든다. git init과 첫 커밋까지 자동.
- `AGENTS.md`: Next.js가 AI용 규칙 파일을 같이 넣어 준다.
- 확인: localhost:3000에 Next 기본 화면이 뜨면 성공. 확인했으면 Ctrl+C로 끄기 (Mac, Windows 동일).
- Windows만: npx 실행 시 "running scripts is disabled" 에러가 나면 `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 한 줄 입력 후 다시 실행.
- 오늘은 템플릿 레포 없이, 빈 폴더에서 시작하는 것부터가 실습이다.

## 1-2. 문서팩 넣고 GitHub에 올리기 (실습 0:13)

1) 문서팩 복사 (macOS 터미널):
```
P=~/Downloads/prd-maker-pack
cp -R $P/docs $P/supabase .
cp $P/CLAUDE.md $P/env.example .
cat $P/AGENTS.append.md >> AGENTS.md
cp env.example .env.local
```
1) 문서팩 복사 (Windows PowerShell):
```
$P = "$HOME\Downloads\prd-maker-pack"
Copy-Item -Recurse "$P\docs", "$P\supabase" .
Copy-Item "$P\CLAUDE.md", "$P\env.example" .
Get-Content "$P\AGENTS.append.md" -Encoding utf8 |
  Add-Content AGENTS.md -Encoding utf8
Copy-Item env.example .env.local
```
2) 커밋하고 GitHub에 올리기 (Mac, Windows 동일. GitHub에서 New repository로 prd-maker 먼저 만들기, README 체크 해제):
```
git add .
git commit -m "docs: add session pack"
git remote add origin https://github.com/<내 아이디>/prd-maker.git
git push -u origin main
```
- 압축 푼 위치가 다르면 P 경로만 바꾸기. AGENTS.md 위쪽 Next.js 블록은 지우지 않기. .env.local은 .gitignore에 있어서 안 올라간다.
- GitHub에 레포가 생기면 링크를 잡담방에 올려 주세요.

## 2. 기획: AI랑 같이 내 버전 정하기 (실습 0:17)

Claude Code / Codex에 보낼 말:
```
docs/PRD.md를 읽어. 나는 이 PRD 메이커를 [___]용으로 바꾸고 싶어.
아직 아무것도 고치지 말고, 먼저 나한테 질문 3개만 해.
내 답을 들으면 PRD.md 8번 "내 버전" 4칸의 후보를 칸마다 2개씩, 장단점과 같이 제안해.
내가 고르면 그때 PRD.md 8번에 써 줘.
DESIGN.md 8번 프리셋도 하나 추천해 줘.
```
순서: 1 AI가 나한테 질문 3개 → 2 칸마다 후보 2개 + 장단점 → 3 내가 고르고 버린다 → 4 PRD.md에 써 주면 직접 읽어 보기
커밋: `git add . && git commit -m "docs: my version"`
실습 노트에 답 쓰고 → AI 튜터 피드백 받기 → 다음 Step

## Step 0. 계획만 세우기, 코드 0줄 (실습 0:23)

Claude Code / Codex에 보낼 말:
```
docs/PRD.md, docs/DESIGN.md, docs/API.md, AGENTS.md를 읽어.
1) 이 프로젝트가 뭘 만드는지 5줄로 요약해.
2) Step 1~4 구현 계획을 단계별로 짧게 세워.
   각 단계에서 만들거나 고칠 파일 이름을 적어.
아직 코드는 쓰지 마.
```
- 확인: 요약이 PRD랑 다르면 여기서 바로 잡기. 나중에 잡으면 비싸다.
- 확인: 계획에 문서에 없는 패키지(zod, shadcn 등)가 있으면 빼 달라고 하기.
- Claude Code 팁: Shift+Tab으로 plan 모드를 켜고 보내면 코드를 안 건드리고 계획만 세운다 (Mac, Windows 동일).
- 계획부터 세우면 AI가 혼자 판단해서 산으로 가는 걸 시작 전에 막을 수 있다.

## Step 1. 화면만, 가짜 데이터 (실습 0:25)

Claude Code / Codex에 보낼 말 (짧게, 계획부터):
```
Step 1. docs/PRD.md, docs/DESIGN.md대로 화면만 만들어 줘.
아직 API는 없으니 가짜 데이터로.
코드 쓰기 전에 계획(만들 파일, 각 파일이 하는 일)부터 보여 줘.
```
- 확인: 계획 받고, 질문하거나 하나 고치기 / npm run dev → localhost:3000 / 입력하고 버튼 → 1초 뒤 카드가 뜨면 성공
- 실습 노트에 내 말로 답할 질문: "use client"는 왜 있을까? 지우면 어떻게 될까?
- 커밋: `git add . && git commit -m "step1: UI with mock data"`

## Step 2. OpenAI 연결 (실습 0:31)

먼저: .env.local에 본인 OpenAI 키 넣고, 터미널에서 Ctrl+C → npm run dev 다시 실행
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-6-luna
```
Claude Code / Codex에 보낼 말 (짧게, 계획부터):
```
Step 2. docs/API.md 4번, 6번대로 OpenAI를 연결해 줘.
이번엔 Supabase 저장 없이 결과만 화면에.
코드 쓰기 전에 계획부터. 특히 키를 어느 파일에서 읽는지 알려 줘.
```
- 확인: 계획 받고, 질문하거나 하나 고치기 / 진짜 PRD가 뜬다(10~30초) / 개발자도구 Network 탭 → specs 요청 어디에도 sk- 키가 없어야 한다 (개발자도구: Mac Cmd+Option+I, Windows F12) / 터미널에 POST /api/specs 201
- 실습 노트에 내 말로 답할 질문: 버튼부터 카드까지 실행 순서를 브라우저 / 서버로 나눠서. 키는 어느 파일에서 읽나?
- 커밋: `git add . && git commit -m "step2: generate PRD with OpenAI"`

## Step 3 준비. Supabase 테이블 만들기 (실습 0:39)

1. SQL Editor → New query: supabase/schema.sql 전체 붙여넣고 Run. "Success. No rows returned"가 나오면 성공
2. Table Editor: specs 테이블이 생겼는지 확인
3. .env.local 채우기: Settings → API Keys에서 Project URL, Secret key 복사 → 아래 두 줄 넣고 Ctrl+C → npm run dev 다시 실행
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```
schema.sql 끝부분:
```
alter table public.specs enable row level security;
grant select, insert, update, delete on public.specs to service_role;
```
- RLS 켜고 정책 0개 = publishable 키로는 아무것도 못 한다. 서버는 secret 키라 통과한다.
- grant가 빠지면 42501 permission denied가 난다. 5/30 이후 만든 프로젝트는 새 테이블이 자동으로 안 열린다.

## Step 3. Supabase 저장 + 목록 (실습 0:41)

Claude Code / Codex에 보낼 말 (짧게, 계획부터):
```
Step 3. docs/API.md 4번, 5번대로 생성 결과를 Supabase specs 테이블에
저장하고, /specs 목록 페이지를 만들어 줘.
코드 쓰기 전에 계획부터. 어떤 키로 Supabase에 붙는지도 알려 줘.
```
- 확인: 계획 받고, 질문하거나 하나 고치기 / PRD 하나 만들고 Table Editor 새로고침 → row가 보이면 성공 / /specs 목록이 뜨고, 새로고침해도 남아 있으면 성공
- 실습 노트에 내 말로 답할 질문: RLS 정책이 0개인데 왜 저장될까? publishable 키로 바꾸면?
- 커밋: `git add . && git commit -m "step3: save to Supabase and list"`

## Step 4. 내 버전 + push (실습 0:47)

Claude Code / Codex에 보낼 말 (직접 써 보기). 예:
```
docs/PRD.md 8번 "내 버전"에 적은 것만 구현해 줘. 계획부터 보여 줘.
```
- 시간 남으면 (PRD 4번 P1): 마크다운 복사 버튼, /specs/[id] 상세 보기와 삭제. 상세 페이지는 Suspense로 감싸야 build가 통과한다 (AGENTS.md에 적혀 있음)
- 확인: PRD.md 8번에 적은 완료 기준 / 출력 섹션을 늘렸으면 required에도 넣었는지 (빠지면 OpenAI 400)
- 커밋: `git add . && git commit -m "step4: my version"` 그리고 `git push`

## 막혔을 때 쓰는 말

1. 에러가 났다 → AI한테:
```
아래 에러가 났다. 고치기 전에 원인부터 설명해. 어느 파일 몇 번째 줄인지, 왜 그런지. 그다음 최소한으로만 고쳐.
[브라우저 에러]
[npm run dev 터미널 로그]
```
서버 에러는 터미널에만 찍힌다. 둘 다 붙여 주세요.

2. AI가 너무 많이 바꿨다 → 터미널:
```
git status
git diff
git restore .
```
마지막 커밋으로 돌아간다. 요청을 더 작게 쪼개서 다시 시켜 보기 (Mac, Windows 동일).

3. 코드가 이해가 안 된다 → AI한테:
```
방금 바꾼 코드를 Next.js 처음 하는 사람한테 설명하듯 파일별로 3줄 이내로 설명해. 그리고 내가 이해했는지 확인할 질문 하나 내줘.
```
이해 안 된 채로 다음 Step 가면 거기서 또 막힌다.

그래도 안 되면 손 들어 주세요. 혼자 10분 넘기지 않기.

## 자주 만나는 에러

| 증상 | 원인 | 해결 |
|---|---|---|
| "OPENAI_API_KEY가 .env.local에 없습니다" | dev 서버 재시작 안 함, 파일 위치·이름 오타 | Ctrl+C → npm run dev, 파일 위치 확인 |
| Windows: "running scripts is disabled" | PowerShell 실행 정책 | Set-ExecutionPolicy -Scope CurrentUser RemoteSigned |
| OpenAI 401 | 키 복사 누락, 앞뒤 공백 | 키 다시 복사 |
| OpenAI 404 모델 없음 | 모델명 오타, 접근 권한 | OPENAI_MODEL=gpt-5.4-mini |
| OpenAI 400 Invalid schema | required 누락, additionalProperties | API.md 6번 strict 규칙 |
| 42501 permission denied | schema.sql의 grant가 안 돌았음 | SQL Editor에서 다시 Run |
| PGRST205 테이블 없음 | SQL 안 돌림, 다른 프로젝트 URL | SQL 실행, URL 확인 |
| 목록이 계속 빔 / row-level security 에러 | secret 자리에 publishable 키 | sb_secret_ 키로 교체 |
| Uncached data ... outside of <Suspense> | Next 16 cacheComponents 기본값 | 페이지를 Suspense로 감싸기 |
| AI가 패키지 깔고 파일을 대량 수정 | 문서 밖 행동 | git restore . 후 작게 다시 |

에러 메시지는 요약하지 말고 그대로 복사해서 AI한테 붙여 주세요.

## 데모: 2~3명 (마무리 0:52)

- 01 아이디어 하나로 PRD 뽑기: 해커톤에서 해 보고 싶은 아이디어면 더 좋다
- 02 내 버전 기능: 8번에서 뭘 골랐고 어떻게 바꿨나
- 03 어디서 막혔고 어떻게 풀었나: AI한테 뭐라고 해서 풀었는지까지
- 마지막에 `git log --oneline` 띄워서 Step 커밋 쌓인 거 보여주기

## 과제 (마감 10/28(수), 해커톤 사전 네트워킹 전까지)

- Vercel 배포: Session 6에서 한 그대로 하되, Environment Variables에 4개(OPENAI_API_KEY, OPENAI_MODEL, SUPABASE_URL, SUPABASE_SECRET_KEY) 등록하고 Redeploy
- P1 기능 1개 더: 마크다운 복사 버튼, 또는 /specs/[id] 상세 보기와 삭제
- 해커톤 아이디어로 PRD 뽑기: 10/31에 팀원한테 바로 보여줄 PRD 하나 만들어 두기
- 제출: 노션 과제 페이지에 GitHub 레포 링크 + 배포 링크
