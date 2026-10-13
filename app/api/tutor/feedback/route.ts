import { MODEL, clip, fallback, focusFor, getClient, logUsage, systemBlocks, toolLine, tutorLimited } from "@/lib/tutor";
import { getUser } from "@/lib/auth";

type Body = { stepId?: string; stepTitle?: string; answers?: { q?: string; a?: string }[]; log?: string; tool?: string };

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
  // 튜터는 로그인한 학회원만 쓴다 (링크가 밖으로 새도 Claude 키가 안전하게)
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요. 새로고침하고 구글로 로그인해 주세요." }, { status: 401 });
  if (tutorLimited(req, user.id)) return Response.json({ error: "요청이 몰렸어요. 1분 뒤에 다시 눌러 주세요." }, { status: 429 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  const stepId = clip(body.stepId, 20);
  const raw = Array.isArray(body.answers) ? body.answers : [];
  const answers = raw.slice(0, 4).map((x, i) => `Q${i + 1}. ${clip(x?.q, 300)}\nA${i + 1}. ${clip(x?.a, 2000) || "(비어 있음)"}`);
  if (!answers.length) return Response.json({ error: "답을 하나 이상 써 주세요" }, { status: 400 });

  const input = `[학회원 답변]
${answers.join("\n\n")}${body.log ? `\n\n[git log] ${clip(body.log, 200)}` : ""}`;

  const model = MODEL();
  const started = Date.now();
  try {
    const res = await getClient().beta.messages.create({
      model,
      max_tokens: 8000,
      ...fallback(model),
      system: systemBlocks(`[지금 단계] ${clip(body.stepTitle, 80)}
${toolLine(body.tool)}
${focusFor(stepId)}

학회원이 "내 말로 답하기"에 쓴 답을 판정한다.
verdict는 good(이해했음) / close(방향은 맞는데 빠진 게 있음) / retry(다시 생각해야 함) 중 하나.
feedback은 2~3문장. next는 학회원에게 던질 질문 하나 (good이면 한 단계 더 깊은 질문, 아니면 스스로 찾게 하는 질문).`),
      messages: [{ role: "user", content: input }],
      output_config: { effort: "low", format: { type: "json_schema", schema } },
    });
    logUsage("feedback", res.model, started, res.usage);
    const text = res.content.find((b) => b.type === "text")?.text;
    if (res.stop_reason === "refusal" || !text) {
      return Response.json({ error: "튜터가 이 답은 판정하기 어렵대요. 개발팀에게 손 들어 주세요." }, { status: 502 });
    }
    return Response.json(JSON.parse(text));
  } catch (e) {
    console.error("[tutor/feedback]", e);
    return Response.json({ error: "튜터 연결이 끊겼어요. 잠시 뒤 다시 눌러 주세요." }, { status: 502 });
  }
}
