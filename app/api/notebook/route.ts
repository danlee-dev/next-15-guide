import { getUser } from "@/lib/auth";
import { rateLimited } from "@/lib/limit";
import { getNotebook, putNotebook } from "@/lib/notebook";

// 저장하는 칸만 골라 받는다 (OS 같은 기기별 설정은 브라우저에만 둔다)
const KEYS = ["name", "tool", "last", "ans", "checks", "fb", "chat", "stuck", "links", "linksBy", "submittedAt"] as const;
const MAX = 400_000; // 글자 수. 튜터 대화가 길어져도 넉넉한 크기

// GET /api/notebook : 내 노트 불러오기
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  try {
    const row = await getNotebook(user.id);
    return Response.json({ data: row?.data ?? null, updatedAt: row?.updated_at ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[notebook GET]", e);
    return Response.json({ error: "노트를 불러오지 못했어요" }, { status: 500 });
  }
}

// PUT /api/notebook : 내 노트 저장 (클라이언트가 2초씩 모아서 보낸다)
export async function PUT(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  if (rateLimited(req, "notebook", 40, 900, user.id)) return Response.json({ error: "저장 요청이 몰렸어요" }, { status: 429 });
  let body: { data?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  if (!body.data || typeof body.data !== "object") return Response.json({ error: "노트가 비었어요" }, { status: 400 });
  const data = Object.fromEntries(KEYS.filter((k) => k in body.data!).map((k) => [k, body.data![k]]));
  if (JSON.stringify(data).length > MAX) return Response.json({ error: "노트가 너무 커요" }, { status: 413 });
  try {
    return Response.json({ ok: true, updatedAt: await putNotebook(user.id, data) });
  } catch (e) {
    console.error("[notebook PUT]", e);
    return Response.json({ error: "노트를 저장하지 못했어요" }, { status: 500 });
  }
}
