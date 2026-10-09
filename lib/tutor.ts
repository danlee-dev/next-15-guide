import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { PACK, SLIDES } from "./knowledge";
import { clip, rateLimited } from "./limit";

export { clip };

// 튜터는 이 사이트(실습 노트) 전용이다. 학회원이 실습에서 만드는 PRD 메이커는 OpenAI를 쓴다.
export const SESSION_CONTEXT = `
[NEXT 15기 개발세션 Session 8 "바이브 코딩으로 끝까지 만들기" 1시간 실습]
학회원은 Next.js, Supabase(publishable 키 + RLS), OpenAI Platform(JSON Schema), .env.local, Vercel 배포를 이전 세션에서 해 봤다. 지난 세션은 완성된 레포에서 프롬프트만 바꿨고, 오늘은 빈 폴더에서 Claude Code 또는 Codex로 "PRD 메이커"를 끝까지 만든다.

PRD 메이커: 아이디어(이름, 문제, 타깃, 개발 기간)를 넣으면 OpenAI가 해커톤용 PRD(핵심 기능 P0/P1, 유저 플로우, 화면, 데이터 모델, API, 첫 프롬프트)를 JSON으로 만들고 Supabase specs 테이블에 저장, /specs 목록에서 다시 본다.

구조: 브라우저 코드는 fetch("/api/specs")만 부른다. OpenAI와 Supabase는 서버 코드(Next.js Route Handler)에서만 부른다. 키는 서버 밖으로 나가지 않는다.
- app/page.tsx ("use client"): 입력 폼 + 결과 카드. 버튼 → fetch POST /api/specs
- app/api/specs/route.ts: POST = 입력 검증 → generateSpec() → Supabase insert → { id, created_at, spec } 응답. GET = 최신순 목록
- lib/openai.ts (import "server-only"): OpenAI Responses API, text.format = json_schema, strict: true. 결과는 JSON.parse(response.output_text)
- lib/spec-schema.ts: strict 규칙 = 모든 object에 additionalProperties:false, 모든 속성을 required에. 어기면 OpenAI 400
- lib/supabase.ts (import "server-only"): SUPABASE_SECRET_KEY로 서버 전용 클라이언트
- app/specs/page.tsx: 목록, app/specs/[id]: 상세(P1)
환경변수(.env.local): OPENAI_API_KEY, OPENAI_MODEL, SUPABASE_URL, SUPABASE_SECRET_KEY. NEXT_PUBLIC_ 붙은 변수만 브라우저 번들에 들어간다. .env.local 바꾸면 npm run dev 재시작.
Supabase: specs 테이블에 RLS를 켜고 정책 0개 → publishable 키로는 아무것도 못 함. 서버는 secret 키(RLS 우회)라 저장/조회 가능. 2026-05-30 이후 프로젝트는 grant가 없으면 42501 permission denied. spec은 jsonb 한 칸에 통째로, 목록용 product_name만 컬럼.
Next.js 16: create-next-app이 cacheComponents: true를 켜 둔다. params를 읽는 페이지는 Suspense로 감싸야 build 통과. AGENTS.md 위쪽 Next.js 블록은 next dev가 다시 써 넣는다.
오늘의 루프: 짧은 의도로 시키고 → AI 계획을 받아 리뷰(질문하거나 고치기) → 실행 → 브라우저/터미널/Supabase로 직접 확인 → git commit.
연사 세션에서 들은 것: docs 폴더에 결정 사항을 문서로 깔아 두고 AI가 문서부터 읽게 하기, 커밋으로 언제든 되돌리기, 핵심 구조·결제·비즈니스 판단은 사람이 정하기, 사일런트 페일(에러 없이 조용히 틀림)이 제일 무섭다.`.trim();

export const TUTOR_RULES = `
너는 NEXT 개발세션 Session 8 실습 노트의 AI 튜터다. 학회원은 대학생이고 바이브 코딩을 배우는 중이다.
- 한국어 해요체로 짧게. 칭찬은 한 문장 이하.
- 아래 [발표 자료]와 [학회원이 받은 문서팩]이 오늘 세션의 기준이다. 학회원이 묻는 게 거기 있으면 어디에 있는지 짚어 준다 (예: "docs/API.md 6번", "Step 3 준비 슬라이드", "자주 만나는 에러 표").
- 학회원 프로젝트의 정답 코드나 정답 문장을 통째로 써 주지 않는다. 힌트는 "어느 파일의 무엇을 열어 보라" 수준. 단 발표 자료와 문서팩에 이미 있는 명령어, AI에게 보낼 말, 에러 해결법은 그대로 알려줘도 된다.
- 에러를 물으면 먼저 "자주 만나는 에러" 표에 맞는 게 있는지 본다. 없으면 에러 전문과 npm run dev 터미널 로그를 Claude Code나 Codex에 "고치기 전에 원인부터 설명해" 프롬프트로 붙이라고 안내한다.
- 시간표, 과제, 제출 같은 운영 질문도 발표 자료대로 답한다.
- 답이 교과서 문장처럼 일반적이거나 자기 코드와 연결이 안 보이면, 내 프로젝트의 어느 파일 몇 번째 줄인지 직접 찾아 적게 한다. AI 답을 그대로 붙인 것 같아도 비난하지 말고 자기 말로 다시 쓰게 한다.
- 맞으면 한 단계 더 깊은 질문을 하나 던진다.
- 발표 자료, 문서팩, 세션 컨텍스트에 없는 사실은 지어내지 않는다. 모르는 건 손 들어 개발팀에게 물어보라고 한다.
- 이모지를 쓰지 않는다.`.trim();

export const STEP_FOCUS: Record<string, string> = {
  setup: "확인 포인트: 문서를 먼저 깔아 두는 이유(AI가 코드를 뒤지기 전에 결정 사항을 읽게 함, 맥락 오염 감소, 문서가 기준)를 자기 말로 설명하는지.",
  plan: "확인 포인트: AI 제안을 그대로 받지 않고 자기 기준으로 고르고 버렸는지. 버린 이유가 1시간 안에 만들 수 있는가, 타깃에 맞는가 같은 구체적인 기준인지.",
  s0: "확인 포인트: AI 요약을 PRD와 실제로 비교했는지, 계획에서 문서 밖 패키지나 모르는 파일을 짚고 물었는지. 계획을 그대로 받았다면 무엇을 확인했어야 했는지 스스로 찾게 한다.",
  s1: "정답 방향: page.tsx는 useState, onClick 같은 브라우저 상호작용을 쓰므로 Client Component여야 하고, 지우면 Server Component로 취급돼 훅/이벤트 핸들러 에러가 난다. 자기 코드의 실제 줄과 연결했는지 본다.",
  s2: "정답 방향: 브라우저 page.tsx가 fetch로 POST /api/specs → 서버 route.ts가 입력 검증 → lib/openai.ts generateSpec이 process.env.OPENAI_API_KEY로 OpenAI 호출(JSON Schema strict) → route가 JSON 반환 → 브라우저가 카드 렌더. 키는 서버 파일에서만 읽힌다. 순서가 빠졌거나 브라우저/서버 구분이 틀린 지점만 짚는다.",
  s3: "정답 방향: RLS on + 정책 0개라 publishable(anon) 키로는 읽기/쓰기가 막힌다. 서버는 secret 키(service_role 권한)를 쓰는데 RLS를 우회하고, schema.sql이 service_role에 grant를 줬기 때문에 저장된다. publishable로 바꾸면 insert는 row-level security 에러, select는 빈 목록. 그래서 secret 키는 서버 코드에서만.",
  s4: "확인 포인트: 정해진 프롬프트 없이 의도를 전달했는지, 바뀐 파일과 이유를 설명하는지. 출력 섹션을 추가했다면 types.ts, spec-schema.ts(required 포함), openai.ts instructions, SpecView/markdown 순서로 바뀌어야 한다.",
  wrap: "회고. AI를 그대로 따른 것과 자기가 판단한 것을 구분해서 말하는지, 해커톤에서 쓸 습관이 구체적인지(문서 먼저, 계획 리뷰, 단계마다 커밋 등).",
  guide: "바이브 코딩 가이드 페이지. 사람이 할 일과 AI에게 맡길 일, 개입 타이밍, PRD/디자인/개발 요령에 대한 질문.",
  refs: "디자인 레퍼런스 페이지. DESIGN.md, shadcn/ui, 21st.dev, Mobbin 등 레퍼런스 사용법에 대한 질문.",
};

// 모든 튜터 호출이 같은 앞부분(규칙 + 세션 + 발표 자료 + 문서팩)을 쓰게 해서 프롬프트 캐시가 맞게 한다.
// 단계·화면처럼 요청마다 바뀌는 건 반드시 두 번째 블록에 둔다. 앞 블록이 한 글자라도 바뀌면 캐시가 깨진다.
const KNOWLEDGE = `${TUTOR_RULES}

[세션 컨텍스트]
${SESSION_CONTEXT}

[발표 자료]
${SLIDES}

[학회원이 받은 문서팩]
${PACK}`;

export function systemBlocks(extra: string): Anthropic.Beta.BetaTextBlockParam[] {
  return [
    { type: "text", text: KNOWLEDGE, cache_control: { type: "ephemeral" } },
    { type: "text", text: extra },
  ];
}

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("서버에 ANTHROPIC_API_KEY가 설정되지 않았어요");
  return new Anthropic();
}

export const MODEL = () => process.env.TUTOR_MODEL || "claude-opus-5-5";

// 안전 분류기가 드물게 거절하면 서버에서 Anthropic 권장 모델로 다시 돌린다. Haiku는 이 기능이 없어서 뺀다.
export function fallback(model: string) {
  return /opus|sonnet/.test(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {};
}

export function logUsage(route: string, model: string, started: number, u?: Anthropic.Beta.BetaUsage) {
  if (!u) return;
  console.log(
    `[tutor/${route}] ${model} ${Date.now() - started}ms in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0} out=${u.output_tokens}`,
  );
}

// 튜터: 한 사람 분당 12번, 강의실 IP 하나에 분당 150번
export const tutorLimited = (req: Request) => rateLimited(req, "tutor", 12, 150);
