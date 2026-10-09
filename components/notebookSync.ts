"use client";

import type { Store } from "./store";
import { authHeader } from "./supa";

// 실습 노트를 계정별로 Supabase 에 저장·불러오기. 브라우저 저장소는 그대로 쓰되(바로 열리게),
// 로그인하면 서버 것과 비교해서 더 최근 것을 쓰고, 바뀌면 서버에도 저장한다.

const AT_KEY = "next-nb-at"; // 이 브라우저에서 노트를 마지막으로 바꾼 시각
const OWNER_KEY = "next-nb-owner"; // 이 브라우저 노트의 주인 계정 (공용 컴퓨터에서 남의 노트가 섞이지 않게)

// 서버에 올리는 칸. OS 같은 기기별 설정과 지금 보는 페이지(cur)는 뺀다
export function syncedPart(s: Store) {
  const chat = Object.fromEntries(Object.entries(s.chat).map(([k, v]) => [k, v.slice(-30)]));
  return { name: s.name, tool: s.tool, last: s.last, ans: s.ans, checks: s.checks, fb: s.fb, chat, stuck: s.stuck, links: s.links, submittedAt: s.submittedAt };
}

const num = (k: string) => {
  try {
    return Number(localStorage.getItem(k) || 0);
  } catch {
    return 0;
  }
};
const set = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export const markLocalChange = () => set(AT_KEY, String(Date.now()));

export async function fetchNotebook(): Promise<{ data: Partial<Store> | null; updatedAt: string | null }> {
  const res = await fetch("/api/notebook", { headers: await authHeader(), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "노트를 불러오지 못했어요");
  return { data: json.data ?? null, updatedAt: json.updatedAt ?? null };
}

export async function saveNotebook(body: string) {
  const res = await fetch("/api/notebook", { method: "PUT", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body });
  if (!res.ok) throw new Error("노트를 저장하지 못했어요");
}

// 로그인 직후: 이 브라우저 노트와 서버 노트 중 무엇을 쓸지 정한다
export function mergeOnLogin(local: Store, empty: Store, uid: string, server: { data: Partial<Store> | null; updatedAt: string | null }): Store {
  let owner = "";
  try {
    owner = localStorage.getItem(OWNER_KEY) || "";
  } catch {}
  // 다른 계정이 쓰던 노트면 비우고 시작한다 (기기 설정과 지금 페이지만 남김)
  const mine = !owner || owner === uid;
  const base = mine ? local : { ...empty, os: local.os, osPicked: local.osPicked, cur: local.cur };
  set(OWNER_KEY, uid);
  const localAt = mine ? num(AT_KEY) : 0;
  const serverAt = server.updatedAt ? Date.parse(server.updatedAt) : 0;
  if (server.data && serverAt >= localAt) return { ...base, ...server.data, links: { ...empty.links, ...(server.data.links || {}) }, os: base.os, osPicked: base.osPicked, cur: base.cur };
  return base;
}
