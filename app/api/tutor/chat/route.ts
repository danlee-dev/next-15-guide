import type Anthropic from "@anthropic-ai/sdk";
import { MODEL, STEP_FOCUS, clip, fallback, getClient, logUsage, systemBlocks, toolLine, tutorLimited } from "@/lib/tutor";
import { getUser } from "@/lib/auth";

type Msg = { role: "user" | "assistant"; content: string };

// POST /api/tutor/chat : 자유 질문, 텍스트 스트리밍으로 응답
export async function POST(req: Request) {
  // 튜터는 로그인한 학회원만 쓴다 (링크가 밖으로 새도 Claude 키가 안전하게)
  const user = await getUser(req);
  if (!user) return new Response("로그인이 필요해요. 새로고침하고 구글로 로그인해 주세요.", { status: 401 });
  if (tutorLimited(req, user.id)) return new Response("요청이 몰렸어요. 1분 뒤에 다시 물어봐 주세요.", { status: 429 });

  let body: { stepId?: string; stepTitle?: string; messages?: Msg[]; tool?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("요청 형식이 잘못됐어요", { status: 400 });
  }
  const stepId = clip(body.stepId, 20);
  const messages: Anthropic.Beta.BetaMessageParam[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && m.content)
    .slice(-8)
    .map((m) => ({ role: m.role, content: clip(m.content, 2000) }));
  // 최근 8개로 자르면 assistant 가 맨 앞에 올 수 있는데, 대화는 user 로 시작해야 한다
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return new Response("질문이 비어 있어요", { status: 400 });

  const model = MODEL();
  const started = Date.now();
  let stream;
  try {
    stream = getClient().beta.messages.stream({
      model,
      max_tokens: 8000,
      ...fallback(model),
      system: systemBlocks(`자유 질문 대화다. 개념 질문에는 비유 하나와 함께 짧게(5문장 이내) 설명하고, "내 코드에서 어디를 보면 되는지"로 끝낸다. 코드 블록은 쓰지 않는다. 마크다운 서식(별표, 샵)도 쓰지 않는다. 명령어나 AI에게 보낼 말을 알려줄 때는 따옴표로 감싼다.

[지금 보고 있는 화면] ${clip(body.stepTitle, 80)}
${toolLine(body.tool)}
${STEP_FOCUS[stepId] || ""}`),
      messages,
      output_config: { effort: "low" },
    });
  } catch (e) {
    console.error("[tutor/chat]", e);
    return new Response("튜터 연결이 끊겼어요. 잠시 뒤 다시 물어봐 주세요.", { status: 502 });
  }

  const enc = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      let sent = false;
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(enc.encode(ev.delta.text));
            sent = true;
          }
        }
        const final = await stream.finalMessage();
        logUsage("chat", final.model, started, final.usage);
        if (!sent) controller.enqueue(enc.encode("이 질문은 튜터가 답하기 어려워요. 개발팀에게 손 들어 주세요."));
      } catch (e) {
        console.error("[tutor/chat stream]", e);
        controller.enqueue(enc.encode("\n(연결이 끊겼어요. 다시 물어봐 주세요.)"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
