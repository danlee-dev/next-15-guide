import "server-only";

// 아주 단순한 요청 제한 (서버 인스턴스 메모리 기준).
// 강의실에선 학회원 전원이 공인 IP 하나를 같이 쓸 수 있어서, 사람(브라우저) 단위로 세고 IP 한도는 넉넉히 둔다.
const hits = new Map<string, number[]>();
function hit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

export const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);

export function clientKey(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return { ip, client: clip(req.headers.get("x-client-id"), 64) };
}

// who: 로그인한 계정 id 를 넘기면 그걸로 센다 (없으면 브라우저 id, 그것도 없으면 IP)
export function rateLimited(req: Request, scope: string, perClient: number, perIp: number, who?: string) {
  const { ip, client } = clientKey(req);
  return hit(`${scope}:c:${who || client || ip}`, perClient, 60_000) || hit(`${scope}:ip:${ip}`, perIp, 60_000);
}
