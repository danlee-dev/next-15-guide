"use client";

import { useEffect, useRef, useState } from "react";
import { type AgentTool } from "@/lib/content";
import { DOCS } from "@/lib/docs";
import { CURRENT, SESSIONS, type Session } from "@/lib/sessions";
import { repoOf, type Store } from "./store";
import { authHeader, supa } from "./supa";
import { stepState } from "./summary";

export type BoardItem = {
  id: string;
  session?: string;
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

// 현황판에 올라가는 내 줄 (세션 하나). 학회원이 쓴 답 내용은 보내지 않는다 (이름, 진행, 막힘, 링크만)
// 제출 링크(s.links)는 지금은 Session 8 것 하나뿐이다. 다음 세션에 제출 칸이 생기면 세션별로 나눈다
export function boardPayload(s: Store, submit = false, ses: Session = CURRENT) {
  return {
    session: ses.id,
    name: s.name.trim(),
    cur: s.cur,
    done: ses.steps.filter((x) => stepState(s, x.id) === "done").length,
    total: ses.steps.length,
    stuck: ses.steps.filter((x) => s.stuck[x.id]).map((x) => `${x.label}: ${s.stuck[x.id]}`).join(" / "),
    tool: s.tool || undefined,
    links: { repo: repoOf(s), deploy: s.links.deploy },
    feature: (s.links.feature || "").trim(),
    submit,
  };
}

export async function postBoard(body: string) {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "저장하지 못했어요");
}

/* ---------- 현황 공유 캐시 (세션별) ----------
   상단 버튼과 현황판이 같은 데이터를 쓴다. 마지막으로 받은 현황을 브라우저에 저장해 두고
   다음에 열 때 그걸 먼저 보여 준 다음 뒤에서 새로 받는다 (그래서 0.5초 빈 화면이 없다). */
const cacheKey = (sid: string) => `next-board-cache-${sid}`;
const boardCache = new Map<string, BoardItem[]>();
const inflight = new Map<string, Promise<BoardItem[]>>();
const subs = new Map<string, Set<(x: BoardItem[]) => void>>();

function cached(sid: string): BoardItem[] | null {
  if (boardCache.has(sid)) return boardCache.get(sid)!;
  try {
    const raw = localStorage.getItem(cacheKey(sid));
    if (raw) boardCache.set(sid, JSON.parse(raw));
  } catch {}
  return boardCache.get(sid) || null;
}

export function refreshBoard(sid: string): Promise<BoardItem[]> {
  const running = inflight.get(sid);
  if (running) return running;
  const p = fetchBoard(sid)
    .then((x) => {
      boardCache.set(sid, x);
      try {
        localStorage.setItem(cacheKey(sid), JSON.stringify(x));
      } catch {}
      subs.get(sid)?.forEach((f) => f(x));
      return x;
    })
    .finally(() => inflight.delete(sid));
  inflight.set(sid, p);
  return p;
}

export function useBoard(sid: string) {
  const [items, setItems] = useState<BoardItem[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(cached(sid));
    const on = (x: BoardItem[]) => {
      setItems(x);
      setErr("");
    };
    if (!subs.has(sid)) subs.set(sid, new Set());
    subs.get(sid)!.add(on);
    refreshBoard(sid).catch((e: Error) => setErr(e.message));
    // 실시간 신호를 놓쳤을 때를 대비한 느린 확인
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refreshBoard(sid).catch(() => {});
    }, 60_000);
    return () => {
      subs.get(sid)?.delete(on);
      clearInterval(id);
    };
  }, [sid]);
  return { items, err };
}

// 실시간: 누가 저장하면 그 세션 현황을 다시 받고, 누가 제출하면 onSubmit 으로 이름과 세션을 알려 준다 (웹소켓)
export function useBoardLive(onSubmit: (name: string, ses: Session | null) => void) {
  const cb = useRef(onSubmit);
  useEffect(() => {
    cb.current = onSubmit;
  });
  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const ch = supa()
      .channel("board")
      .on("broadcast", { event: "update" }, ({ payload }) => {
        const sid = typeof payload?.session === "string" ? payload.session : CURRENT.id;
        // 여러 명이 한꺼번에 저장해도 한 번만 다시 받는다
        clearTimeout(timers.get(sid));
        timers.set(sid, setTimeout(() => refreshBoard(sid).catch(() => {}), 300));
        if (payload?.kind === "submit" && typeof payload.name === "string") cb.current(payload.name, SESSIONS.find((x) => x.id === sid) || null);
      })
      .subscribe();
    const onVis = () => {
      if (document.visibilityState === "visible") subs.forEach((set, sid) => set.size && refreshBoard(sid).catch(() => {}));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      timers.forEach((t) => clearTimeout(t));
      supa().removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}

export async function fetchBoard(sid: string): Promise<BoardItem[]> {
  const res = await fetch(`/api/board?session=${encodeURIComponent(sid)}`, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "현황을 불러오지 못했어요");
  return json.items || [];
}

export const PAGE_LABEL: Record<string, string> = {
  ...Object.fromEntries(SESSIONS.flatMap((x) => x.steps.map((st) => [st.id, st.label]))),
  ...Object.fromEntries(SESSIONS.map((x) => [x.page, `Session ${x.no} 개요`])),
  home: "홈",
  guide: "가이드",
  refs: "레퍼런스",
  board: "현황판",
  library: "자료실",
  ...Object.fromEntries(DOCS.map((d) => [d.id, d.label])),
};

// 로그인한 사람의 저장된 이름과 도구 (이름이 없으면 구글 계정 이름을 제안값으로)
export async function fetchMe(): Promise<{ name: string | null; tool: AgentTool | null; suggested: string | null }> {
  const res = await fetch("/api/me", { headers: await authHeader(), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "정보를 불러오지 못했어요");
  const tool = json.tool === "claude" || json.tool === "codex" ? json.tool : null;
  return { name: json.name ?? null, tool, suggested: json.suggested ?? null };
}
