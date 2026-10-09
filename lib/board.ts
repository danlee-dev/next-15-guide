import "server-only";
import { createHash } from "node:crypto";

// 제출 현황판 저장소. 실습 앱과 같은 방식으로 secret 키를 가진 서버만 Supabase board 테이블을 읽고 쓴다.
// 패키지를 늘리지 않으려고 supabase-js 대신 REST(PostgREST)를 fetch로 직접 부른다.

export type BoardItem = {
  id: string; // client_id 의 짧은 해시. 화면에서 줄을 구분하는 용도라 되돌릴 수 없다
  name: string;
  cur: string | null;
  done: number;
  total: number;
  stuck: string | null;
  tool: "claude" | "codex" | null;
  feature: string | null;
  repo_url: string | null;
  deploy_url: string | null;
  submitted_at: string | null;
  updated_at: string;
};

function conf() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("서버에 SUPABASE_URL / SUPABASE_SECRET_KEY가 설정되지 않았어요");
  return { url, key };
}

async function rest(path: string, init: RequestInit = {}) {
  const { url, key } = conf();
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  });
}

const COLS = "client_id,name,cur,done,total,stuck,tool,feature,repo_url,deploy_url,submitted_at,updated_at";

// client_id 는 절대 그대로 내보내지 않는다. 그걸 알면 남의 줄을 덮어쓸 수 있어서 해시로 바꾼다.
export async function listBoard(): Promise<BoardItem[]> {
  const r = await rest(`board?select=${COLS}&order=updated_at.desc&limit=300`);
  if (!r.ok) throw new Error(`board list ${r.status} ${await r.text()}`);
  const rows: (Omit<BoardItem, "id"> & { client_id: string })[] = await r.json();
  return rows.map(({ client_id, ...rest }) => ({ id: createHash("sha256").update(client_id).digest("hex").slice(0, 12), ...rest }));
}

export async function upsertBoard(row: Record<string, unknown>) {
  const r = await rest("board?on_conflict=client_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`board upsert ${r.status} ${await r.text()}`);
}

// 현황판이 바뀌었다고 열려 있는 화면들에 알린다 (Supabase Realtime Broadcast, 공개 채널 "board").
// 테이블은 서버만 읽을 수 있어서 DB 변경을 직접 구독하게 할 수 없다. 그래서 이름과 종류만 실어 보내고,
// 받은 화면이 /api/board 로 다시 읽어 간다. 실패해도 저장에는 영향 없음
export async function broadcastBoard(payload: { kind: "update" | "submit"; name: string }) {
  try {
    const { url, key } = conf();
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ topic: "board", event: "update", payload }] }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (e) {
    console.error("[board broadcast]", e);
  }
}

// 로그인한 사람의 저장된 이름과 도구 (다른 기기에서 로그인해도 기억하려고)
export async function getMe(clientId: string): Promise<{ name: string | null; tool: string | null }> {
  const r = await rest(`board?select=name,tool&client_id=eq.${encodeURIComponent(clientId)}&limit=1`);
  if (!r.ok) throw new Error(`board me ${r.status} ${await r.text()}`);
  const rows: { name: string; tool: string | null }[] = await r.json();
  return { name: rows[0]?.name ?? null, tool: rows[0]?.tool ?? null };
}
