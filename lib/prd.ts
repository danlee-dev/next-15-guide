import "server-only";
import { rest } from "./board";

// 소모임 PRD 제출과 피드백 저장소. board 와 같이 secret 키를 가진 서버만 Supabase 를 읽고 쓴다.
// 볼 수 있는 사람: 올린 본인과 운영진(ADMIN_EMAILS). 운영진 이메일은 코드에 두지 않고 환경 변수로만 받는다.

export type PrdRow = { id: string; user_id: string; session: string; name: string; filename: string; content: string; version: number; created_at: string; updated_at: string };
export type PrdComment = { id: string; prd_id: string; user_id: string; author: string; is_admin: boolean; section: string; version: number; body: string; created_at: string };
export type PrdSummary = Omit<PrdRow, "content" | "user_id"> & { comments: number };

export const PRD_MAX = 200_000; // 글자 수. PRD 한 장으로는 넉넉하다

export function isAdmin(email: string | null) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

const enc = encodeURIComponent;

async function json<T>(r: Response, what: string): Promise<T> {
  if (!r.ok) throw new Error(`${what} ${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

export async function getPrd(id: string) {
  const rows = await json<PrdRow[]>(await rest(`prd?id=eq.${enc(id)}&limit=1`), "prd get");
  return rows[0] || null;
}

export async function getMyPrd(userId: string, session: string) {
  const rows = await json<PrdRow[]>(await rest(`prd?user_id=eq.${enc(userId)}&session=eq.${enc(session)}&limit=1`), "prd mine");
  return rows[0] || null;
}

// 운영진 목록: 본문은 빼고, 피드백 수만 붙인다
export async function listPrds(session: string): Promise<PrdSummary[]> {
  const rows = await json<(Omit<PrdRow, "content" | "user_id"> & { prd_comment: { count: number }[] })[]>(
    await rest(`prd?select=id,session,name,filename,version,created_at,updated_at,prd_comment(count)&session=eq.${enc(session)}&order=updated_at.desc&limit=300`),
    "prd list",
  );
  return rows.map(({ prd_comment, ...r }) => ({ ...r, comments: prd_comment?.[0]?.count ?? 0 }));
}

// 다시 올리면 같은 줄을 덮어쓰고 버전을 올린다
export async function savePrd(userId: string, session: string, name: string, filename: string, content: string) {
  const prev = await getMyPrd(userId, session);
  if (prev) {
    const rows = await json<PrdRow[]>(
      await rest(`prd?id=eq.${enc(prev.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name, filename, content, version: prev.version + 1, updated_at: new Date().toISOString() }),
      }),
      "prd update",
    );
    return rows[0];
  }
  const rows = await json<PrdRow[]>(
    await rest("prd", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ user_id: userId, session, name, filename, content }) }),
    "prd insert",
  );
  return rows[0];
}

export async function listComments(prdId: string) {
  return json<PrdComment[]>(await rest(`prd_comment?prd_id=eq.${enc(prdId)}&order=created_at.asc&limit=500`), "prd comments");
}

export async function addComment(row: Omit<PrdComment, "id" | "created_at">) {
  const rows = await json<PrdComment[]>(await rest("prd_comment", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }), "prd comment add");
  return rows[0];
}

export async function getComment(id: string) {
  const rows = await json<PrdComment[]>(await rest(`prd_comment?id=eq.${enc(id)}&limit=1`), "prd comment get");
  return rows[0] || null;
}

export async function deleteComment(id: string) {
  const r = await rest(`prd_comment?id=eq.${enc(id)}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`prd comment delete ${r.status} ${await r.text()}`);
}
