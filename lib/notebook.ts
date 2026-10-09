import "server-only";
import { rest } from "./board";

// 계정별 실습 노트 전체(체크, 답, 튜터 대화, 제출 링크). 브라우저 저장소는 도메인·기기마다 따로라서
// 로그인하면 여기서 불러오고, 바뀌면 다시 저장한다. board 와 같이 secret 키를 가진 서버만 읽고 쓴다.

export async function getNotebook(clientId: string): Promise<{ data: unknown; updated_at: string } | null> {
  const r = await rest(`notebook?select=data,updated_at&client_id=eq.${encodeURIComponent(clientId)}&limit=1`);
  if (!r.ok) throw new Error(`notebook get ${r.status} ${await r.text()}`);
  const rows: { data: unknown; updated_at: string }[] = await r.json();
  return rows[0] || null;
}

export async function putNotebook(clientId: string, data: unknown) {
  const updated_at = new Date().toISOString();
  const r = await rest("notebook?on_conflict=client_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ client_id: clientId, data, updated_at }),
  });
  if (!r.ok) throw new Error(`notebook put ${r.status} ${await r.text()}`);
  return updated_at;
}
