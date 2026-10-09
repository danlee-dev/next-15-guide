# Session 8 실습 노트

NEXT 15기 개발세션 8 "바이브 코딩으로 끝까지 만들기" 실습용 사이트.
학회원은 이 페이지를 켜 놓고 단계별로 체크리스트를 따라가고, 내 말로 답을 쓰고, AI 튜터에게 피드백을 받는다.

- 단계: 준비 → 기획 → Step 1~4 → 회고
- 바이브 코딩 가이드: 사람이 할 일 / AI에게 맡길 일, 개입 타이밍, PRD·디자인·개발 요령
- 디자인 레퍼런스: getdesign.md, awesome-design-md, shadcn/ui, 21st.dev, Mobbin, Refero, Dribbble 등
- AI 튜터: `/api/tutor/feedback` (JSON Schema 판정), `/api/tutor/chat` (스트리밍). 학회 OpenAI 키로 서버에서만 호출
- 학회원 답은 각자 브라우저 localStorage에만 저장. 회고 단계에서 "제출 요약 복사"

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # OPENAI_API_KEY 채우기
npm run dev
```

## 배포 (Vercel)

1. 이 폴더를 GitHub 레포로 push
2. vercel.com > Add New > Project > 레포 Import
3. Environment Variables에 `OPENAI_API_KEY`, `OPENAI_MODEL` 추가 > Deploy

튜터 API에는 IP당 분당 20회 제한이 걸려 있다 (`lib/tutor.ts`). 세션이 끝나면 키를 폐기하거나 사용 한도를 걸어 둘 것.

## 구조

```
app/page.tsx                 Notebook 렌더
app/api/tutor/feedback       답 판정 + 피드백 + 다음 질문
app/api/tutor/chat           자유 질문 스트리밍
components/Notebook.tsx      상단바, 사이드바, 페이지 전환
components/StepView.tsx      단계 화면
components/GuideView.tsx     바이브 코딩 가이드
components/RefsView.tsx      디자인 레퍼런스
lib/content.ts               단계, 명령어, 가이드, 레퍼런스 내용 (내용 수정은 여기서)
lib/tutor.ts                 튜터가 아는 세션 컨텍스트, 단계별 채점 기준
```
