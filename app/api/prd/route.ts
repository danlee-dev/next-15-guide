import { getUser } from "@/lib/auth";
import { clip, rateLimited } from "@/lib/limit";
import { PRD_MAX, getMyPrd, getPrd, isAdmin, listComments, listPrds, savePrd, type PrdComment, type PrdRow } from "@/lib/prd";
import { broadcastBoard, upsertBoard } from "@/lib/board";
import { sessionById } from "@/lib/sessions";

// 화면으로 내보낼 때는 계정 id 를 빼고 "내 것인지"만 알려 준다
const outPrd = ({ user_id, ...p }: PrdRow, me: string) => ({ ...p, mine: user_id === me });
const outComment = ({ user_id, ...c }: PrdComment, me: string) => ({ ...c, mine: user_id === me });

// GET /api/prd?session=nb1  : 내 PRD(+피드백). 운영진이면 그 회차 전체 목록도
// GET /api/prd?id=...       : PRD 하나(+피드백). 본인과 운영진만
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  const admin = isAdmin(user.email);
  const url = new URL(req.url);
  const id = clip(url.searchParams.get("id"), 64);
  try {
    if (id) {
      const prd = await getPrd(id);
      if (!prd || (prd.user_id !== user.id && !admin)) return Response.json({ error: "볼 수 없는 PRD예요" }, { status: 404 });
      const comments = await listComments(prd.id);
      return Response.json({ admin, prd: outPrd(prd, user.id), comments: comments.map((c) => outComment(c, user.id)) }, { headers: { "Cache-Control": "no-store" } });
    }
    const session = clip(url.searchParams.get("session"), 20);
    if (sessionById(session)?.kind !== "club") return Response.json({ error: "없는 회차예요" }, { status: 400 });
    const mine = await getMyPrd(user.id, session);
    const comments = mine ? await listComments(mine.id) : [];
    const list = admin ? await listPrds(session) : null;
    return Response.json(
      { admin, mine: mine ? outPrd(mine, user.id) : null, comments: comments.map((c) => outComment(c, user.id)), list },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[prd GET]", e);
    return Response.json({ error: "PRD를 불러오지 못했어요" }, { status: 500 });
  }
}

// POST /api/prd : PRD 파일 올리기 (다시 올리면 새 버전)
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  if (rateLimited(req, "prd", 10, 300, user.id)) return Response.json({ error: "1분 뒤에 다시 올려 주세요" }, { status: 429 });
  let body: { session?: string; name?: string; filename?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  const session = clip(body.session, 20);
  const ses = sessionById(session);
  if (ses?.kind !== "club") return Response.json({ error: "없는 회차예요" }, { status: 400 });
  const filename = clip(body.filename, 120).replace(/[^\w.\-가-힣 ]/g, "_");
  if (!/\.(md|markdown|txt)$/i.test(filename)) return Response.json({ error: ".md 파일만 올릴 수 있어요" }, { status: 400 });
  const content = typeof body.content === "string" ? body.content.replace(/\r\n/g, "\n") : "";
  if (!content.trim()) return Response.json({ error: "파일이 비어 있어요" }, { status: 400 });
  if (content.length > PRD_MAX) return Response.json({ error: "파일이 너무 커요 (20만 자까지)" }, { status: 413 });
  const name = clip(body.name, 40).trim() || user.name || "이름 없음";
  try {
    const prd = await savePrd(user.id, session, name, filename, content);
    // 올리면 곧 제출이다: 현황판 같은 줄에 기획서 버전을 적고, 열려 있는 화면들에 바로 알린다
    const now = new Date().toISOString();
    await upsertBoard({ client_id: user.id, session, name, total: ses.steps.length, prd_id: prd.id, prd_version: prd.version, submitted_at: now, updated_at: now }).catch((e) =>
      console.error("[prd board]", e),
    );
    await broadcastBoard({ kind: "submit", name, session, prd: prd.id, version: prd.version });
    return Response.json({ prd: outPrd(prd, user.id) });
  } catch (e) {
    console.error("[prd POST]", e);
    return Response.json({ error: "PRD를 저장하지 못했어요" }, { status: 500 });
  }
}
