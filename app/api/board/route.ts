import { after } from "next/server";
import { broadcastBoard, listBoard, upsertBoard } from "@/lib/board";
import { getUser } from "@/lib/auth";
import { clip, rateLimited } from "@/lib/limit";
import { CURRENT, SESSION_IDS } from "@/lib/sessions";

type Body = {
  session?: string;
  name?: string;
  cur?: string;
  done?: number;
  total?: number;
  stuck?: string;
  tool?: string;
  feature?: string;
  links?: { repo?: string; deploy?: string };
  submit?: boolean;
};

// 링크는 https만 받는다. "github.com/..."처럼 앞부분을 빼고 적어도 받아 준다.
function cleanUrl(v: unknown, host?: RegExp): string | null | "bad" {
  const s = clip(v, 300).trim();
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "bad";
    if (host && !host.test(u.hostname)) return "bad";
    u.protocol = "https:";
    return u.toString().replace(/\/$/, "");
  } catch {
    return "bad";
  }
}

const sessionParam = (v: unknown) => (typeof v === "string" && SESSION_IDS.includes(v) ? v : CURRENT.id);

// GET /api/board?session=s8 : 누구나 보는 세션별 제출 현황 (client_id 는 빼고)
export async function GET(req: Request) {
  if (rateLimited(req, "board-get", 30, 600)) return Response.json({ error: "잠시 뒤에 다시 열어 주세요" }, { status: 429 });
  try {
    const session = sessionParam(new URL(req.url).searchParams.get("session"));
    return Response.json({ items: await listBoard(session) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[board GET]", e);
    return Response.json({ error: "현황을 불러오지 못했어요" }, { status: 500 });
  }
}

// POST /api/board : 내 줄 저장 (이름, 진행, 막힘, 제출 링크). 구글 로그인 계정 id 로 구분한다
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해요" }, { status: 401 });
  if (rateLimited(req, "board-post", 40, 900, user.id)) return Response.json({ error: "요청이 몰렸어요. 잠시 뒤 다시 해 주세요." }, { status: 429 });
  const client = user.id;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "요청 형식이 잘못됐어요" }, { status: 400 });
  }
  const name = clip(body.name, 30).trim();
  if (!name) return Response.json({ error: "이름을 적어 주세요" }, { status: 400 });

  const session = sessionParam(body.session);
  const row: Record<string, unknown> = {
    client_id: client,
    session,
    name,
    cur: clip(body.cur, 20) || null,
    done: Math.max(0, Math.min(50, Math.floor(Number(body.done) || 0))),
    total: Math.max(1, Math.min(50, Math.floor(Number(body.total) || 7))),
    stuck: clip(body.stuck, 200).trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (body.tool === "claude" || body.tool === "codex") row.tool = body.tool;
  // 과제로 추가한 기능 설명. 지운 것도 반영되게 문자열이 오면 항상 덮어쓴다
  if (body.submit && typeof body.feature === "string") row.feature = clip(body.feature, 400).trim() || null;

  // 제출 링크는 "제출" 버튼으로 보낼 때만 바꾼다. 자동 저장(다른 기기, 새 주소에서 빈 노트로 시작한 경우 포함)이 덮어쓰지 않게
  if (body.submit && body.links) {
    const repo = cleanUrl(body.links.repo, /(^|\.)github\.com$/i);
    const deploy = cleanUrl(body.links.deploy);
    // "제출" 버튼일 때만 이상한 주소를 알려 준다. 자동 저장 중엔 쓰다 만 주소일 수 있으니 그 칸만 건너뛴다
    if (body.submit && !repo) return Response.json({ error: "GitHub 레포 주소를 적어 주세요" }, { status: 400 });
    if (body.submit && repo === "bad") return Response.json({ error: "GitHub 레포 주소가 이상해요. https://github.com/아이디/prd-maker 처럼 적어 주세요" }, { status: 400 });
    if (body.submit && deploy === "bad") return Response.json({ error: "배포 주소가 이상해요. https://로 시작하는 주소를 붙여 주세요" }, { status: 400 });
    if (repo !== "bad") row.repo_url = repo;
    if (deploy !== "bad") row.deploy_url = deploy;
    if (body.submit && repo) row.submitted_at = new Date().toISOString();
  }

  try {
    await upsertBoard(row);
    // 응답을 먼저 보내고, 다른 화면에 "바뀌었어요" 신호
    after(() => broadcastBoard({ kind: row.submitted_at ? "submit" : "update", name, session }));
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[board POST]", e);
    return Response.json({ error: "저장하지 못했어요. 잠시 뒤 다시 해 주세요." }, { status: 500 });
  }
}
