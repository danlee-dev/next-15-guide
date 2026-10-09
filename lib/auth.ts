import "server-only";

// 브라우저가 보낸 Supabase 로그인 토큰을 Supabase에 물어 누구인지 확인한다. 실패하면 null
export type AuthUser = { id: string; email: string | null; name: string | null };

export async function getUser(req: Request): Promise<AuthUser | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!token || !url || !key) return null;
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!r.ok) return null;
    const u = await r.json();
    if (!u?.id) return null;
    return { id: u.id, email: u.email ?? null, name: u.user_metadata?.full_name || u.user_metadata?.name || null };
  } catch {
    return null;
  }
}
