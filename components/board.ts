"use client";

import { useEffect, useRef, useState } from "react";
import { STEPS, type AgentTool } from "@/lib/content";
import { DOCS } from "@/lib/docs";
import { repoOf, type Store } from "./store";
import { authHeader, supa } from "./supa";
import { stepState } from "./summary";

export type BoardItem = {
  id: string;
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

// 현황판에 올라가는 내 줄. 학회원이 쓴 답 내용은 보내지 않는다 (이름, 진행, 막힘, 링크만)
export function boardPayload(s: Store, submit = false) {
  return {
    name: s.name.trim(),
    cur: s.cur,
    done: STEPS.filter((x) => stepState(s, x.id) === "done").length,
    total: STEPS.length,
    stuck: STEPS.filter((x) => s.stuck[x.id]).map((x) => `${x.label}: ${s.stuck[x.id]}`).join(" / "),
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

/* ---------- 현황 공유 캐시 ----------
   상단 버튼과 현황판이 같은 데이터를 쓴다. 마지막으로 받은 현황을 브라우저에 저장해 두고
   다음에 열 때 그걸 먼저 보여 준 다음 뒤에서 새로 받는다 (그래서 0.5초 빈 화면이 없다). */
const CACHE_KEY = "next-s8-board-cache";
let boardCache: BoardItem[] | null = null;
let inflight: Promise<BoardItem[]> | null = null;
const subs = new Set<(x: BoardItem[]) => void>();

function cached(): BoardItem[] | null {
  if (boardCache) return boardCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) boardCache = JSON.parse(raw);
  } catch {}
  return boardCache;
}

export function refreshBoard(): Promise<BoardItem[]> {
  inflight ||= fetchBoard()
    .then((x) => {
      boardCache = x;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(x));
      } catch {}
      subs.forEach((f) => f(x));
      return x;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useBoard() {
  const [items, setItems] = useState<BoardItem[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    const c = cached();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c) setItems(c);
    const on = (x: BoardItem[]) => {
      setItems(x);
      setErr("");
    };
    subs.add(on);
    refreshBoard().catch((e: Error) => setErr(e.message));
    // 실시간 신호를 놓쳤을 때를 대비한 느린 확인
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refreshBoard().catch(() => {});
    }, 60_000);
    return () => {
      subs.delete(on);
      clearInterval(id);
    };
  }, []);
  return { items, err };
}

// 실시간: 누가 저장하면 현황을 다시 받고, 누가 제출하면 onSubmit 으로 이름을 알려 준다 (웹소켓)
export function useBoardLive(onSubmit: (name: string) => void) {
  const cb = useRef(onSubmit);
  useEffect(() => {
    cb.current = onSubmit;
  });
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const ch = supa()
      .channel("board")
      .on("broadcast", { event: "update" }, ({ payload }) => {
        // 여러 명이 한꺼번에 저장해도 한 번만 다시 받는다
        clearTimeout(t);
        t = setTimeout(() => refreshBoard().catch(() => {}), 300);
        if (payload?.kind === "submit" && typeof payload.name === "string") cb.current(payload.name);
      })
      .subscribe();
    const onVis = () => {
      if (document.visibilityState === "visible") refreshBoard().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(t);
      supa().removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}

export async function fetchBoard(): Promise<BoardItem[]> {
  const res = await fetch("/api/board", { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "현황을 불러오지 못했어요");
  return json.items || [];
}

export const PAGE_LABEL: Record<string, string> = {
  ...Object.fromEntries(STEPS.map((x) => [x.id, x.label])),
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
