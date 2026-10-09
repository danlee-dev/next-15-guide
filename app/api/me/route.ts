import { getUser } from "@/lib/auth";
import { getName } from "@/lib/board";

// GET /api/me : 로그인한 사람의 저장된 이름. 처음이면 구글 계정 이름을 제안값으로 준다
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  try {
    return Response.json({ name: await getName(user.id), suggested: user.name, email: user.email }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[me]", e);
    return Response.json({ error: "정보를 불러오지 못했어요" }, { status: 500 });
  }
}
