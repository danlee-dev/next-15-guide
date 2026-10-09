import { MODEL, SESSION_CONTEXT, STEP_FOCUS, TUTOR_RULES, clip, getClient, rateLimited } from "@/lib/tutor";

type Msg = { role: "user" | "assistant"; content: string };

// POST /api/tutor/chat : 자유 질문, 텍스트 스트리밍으로 응답
export async function POST(req: Request) {
  if (rateLimited(req)) return new Response("요청이 몰렸어요. 1분 뒤에 다시 물어봐 주세요.", { status: 429 });

  let body: { stepId?: string; stepTitle?: string; messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return new Response("요청 형식이 잘못됐어요", { status: 400 });
  }
  const stepId = clip(body.stepId, 20);
  const messages = (body.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-8)
    .map((m) => ({ role: m.role, content: clip(m.content, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return new Response("질문이 비어 있어요", { status: 400 });

  const instructions = `${TUTOR_RULES}
- 자유 질문 대화다. 개념 질문에는 비유 하나와 함께 짧게(5문장 이내) 설명하고, "내 코드에서 어디를 보면 되는지"로 끝낸다. 코드 블록은 쓰지 않는다. 마크다운 서식(별표, 샵)도 쓰지 않는다.

[세션 컨텍스트]
${SESSION_CONTEXT}

[지금 보고 있는 화면] ${clip(body.stepTitle, 80)}
${STEP_FOCUS[stepId] || ""}`;

  let stream;
  try {
    stream = await getClient().responses.create({ model: MODEL(), instructions, input: messages, stream: true });
  } catch (e) {
    console.error("[tutor/chat]", e);
    return new Response("튜터 연결이 끊겼어요. 잠시 뒤 다시 물어봐 주세요.", { status: 502 });
  }

  const enc = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of stream) {
          if (ev.type === "response.output_text.delta") controller.enqueue(enc.encode(ev.delta));
        }
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
