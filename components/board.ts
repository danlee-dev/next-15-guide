"use client";

import { STEPS } from "@/lib/content";
import { clientId, type Store } from "./store";
import { stepState } from "./summary";

export type BoardItem = {
  id: string;
  name: string;
  cur: string | null;
  done: number;
  total: number;
  stuck: string | null;
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
    links: { repo: s.links.repo || s.ans.setup?.repo || "", deploy: s.links.deploy },
    submit,
  };
}

export async function postBoard(body: string) {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-client-id": clientId() },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "저장하지 못했어요");
}

export async function fetchBoard(): Promise<BoardItem[]> {
  const res = await fetch("/api/board", { headers: { "x-client-id": clientId() }, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "현황을 불러오지 못했어요");
  return json.items || [];
}

export const PAGE_LABEL: Record<string, string> = {
  ...Object.fromEntries(STEPS.map((x) => [x.id, x.label])),
  guide: "가이드",
  refs: "레퍼런스",
  board: "현황판",
};
