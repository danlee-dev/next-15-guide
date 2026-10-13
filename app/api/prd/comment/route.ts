import { getUser } from "@/lib/auth";
import { clip, rateLimited } from "@/lib/limit";
import { addComment, deleteComment, getComment, getPrd, isAdmin } from "@/lib/prd";

// POST /api/prd/comment : 피드백 달기. 운영진과 PRD 주인(답글)만
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  if (rateLimited(req, "prd-comment", 30, 600, user.id)) return Response.json({ error: "잠시 뒤에 다시 달아 주세요" }, { status: 429 });
  let body: { prdId?: string; section?: string; body?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  const text = clip(body.body, 4000).trim();
  if (!text) return Response.json({ error: "내용을 적어 주세요" }, { status: 400 });
  const admin = isAdmin(user.email);
  try {
    const prd = await getPrd(clip(body.prdId, 64));
    if (!prd || (prd.user_id !== user.id && !admin)) return Response.json({ error: "볼 수 없는 PRD예요" }, { status: 404 });
    const c = await addComment({
      prd_id: prd.id,
      user_id: user.id,
      author: clip(body.name, 40).trim() || user.name || (admin ? "운영진" : "이름 없음"),
      is_admin: admin,
      section: clip(body.section, 120) || "*",
      version: prd.version,
      body: text,
    });
    const { user_id, ...rest } = c;
    return Response.json({ comment: { ...rest, mine: user_id === user.id } });
  } catch (e) {
    console.error("[prd comment POST]", e);
    return Response.json({ error: "피드백을 저장하지 못했어요" }, { status: 500 });
  }
}

// DELETE /api/prd/comment?id=... : 내가 단 것만 지울 수 있다 (운영진은 전부)
export async function DELETE(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  const id = clip(new URL(req.url).searchParams.get("id"), 64);
  try {
    const c = await getComment(id);
    if (!c) return Response.json({ ok: true });
    if (c.user_id !== user.id && !isAdmin(user.email)) return Response.json({ error: "내가 단 것만 지울 수 있어요" }, { status: 403 });
    await deleteComment(id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[prd comment DELETE]", e);
    return Response.json({ error: "지우지 못했어요" }, { status: 500 });
  }
}
