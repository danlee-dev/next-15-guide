import { MODEL, SESSION_CONTEXT, STEP_FOCUS, TUTOR_RULES, clip, getClient, rateLimited } from "@/lib/tutor";

type Body = { stepId?: string; stepTitle?: string; answers?: { q?: string; a?: string }[]; log?: string };

const schema = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["good", "close", "retry"] },
    feedback: { type: "string" },
    next: { type: "string" },
  },
  required: ["verdict", "feedback", "next"],
  additionalProperties: false,
};

// POST /api/tutor/feedback : 학회원 답을 보고 판정 + 피드백 + 다음 질문
export async function POST(req: Request) {
  if (rateLimited(req)) return Response.json({ error: "요청이 몰렸어요. 1분 뒤에 다시 눌러 주세요." }, { status: 429 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  const stepId = clip(body.stepId, 20);
  const answers = (body.answers || []).slice(0, 4).map((x, i) => `Q${i + 1}. ${clip(x.q, 300)}\nA${i + 1}. ${clip(x.a, 2000) || "(비어 있음)"}`);
  if (!answers.length) return Response.json({ error: "답을 하나 이상 써 주세요" }, { status: 400 });

  const input = `[지금 단계] ${clip(body.stepTitle, 80)}
${STEP_FOCUS[stepId] || ""}

[학회원 답변]
${answers.join("\n\n")}${body.log ? `\n\n[git log] ${clip(body.log, 200)}` : ""}

verdict는 good(이해했음) / close(방향은 맞는데 빠진 게 있음) / retry(다시 생각해야 함) 중 하나.
feedback은 2~3문장. next는 학회원에게 던질 질문 하나 (good이면 한 단계 더 깊은 질문, 아니면 스스로 찾게 하는 질문).`;

  try {
    const res = await getClient().responses.create({
      model: MODEL(),
      instructions: `${TUTOR_RULES}\n\n[세션 컨텍스트]\n${SESSION_CONTEXT}`,
      input,
      text: { format: { type: "json_schema", name: "feedback", schema, strict: true } },
    });
    return Response.json(JSON.parse(res.output_text));
  } catch (e) {
    console.error("[tutor/feedback]", e);
    return Response.json({ error: "튜터 연결이 끊겼어요. 잠시 뒤 다시 눌러 주세요." }, { status: 502 });
  }
}
