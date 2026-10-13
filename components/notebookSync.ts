"use client";

import type { ChatMsg, Feedback, Links, Store } from "./store";
import { authHeader } from "./supa";

// 실습 노트를 계정별로 Supabase 에 저장·불러오기.
// 브라우저 저장소는 그대로 쓰되(바로 열리게), 로그인하면 서버 노트와 칸별로 합치고, 바뀔 때마다 서버에 저장한다.
// 원칙: 어느 쪽에 적은 내용도 지우지 않는다. 시계가 틀린 노트북이 있어도 안전하게, 시각 비교 대신
// "이 브라우저가 마지막으로 맞춘 서버 버전"(SYNCED_KEY)과 서버 버전이 같은지로 어느 쪽이 최신인지 정한다.

const SYNCED_KEY = "next-nb-synced"; // 이 브라우저가 마지막으로 불러오거나 저장한 서버 버전(updated_at)
const OWNER_KEY = "next-nb-owner"; // 이 브라우저 노트의 주인 계정 (공용 컴퓨터에서 남의 노트가 섞이지 않게)

export type Synced = Pick<Store, "name" | "tool" | "last" | "ans" | "checks" | "fb" | "chat" | "stuck" | "links" | "submittedAt"> & { linksBy?: Record<string, Links> };

// 서버에 올리는 칸. OS 같은 기기별 설정과 지금 보는 페이지(cur)는 뺀다
export function syncedPart(s: Store): Synced {
  const chat = Object.fromEntries(Object.entries(s.chat).map(([k, v]) => [k, v.slice(-30)]));
  return { name: s.name, tool: s.tool, last: s.last, ans: s.ans, checks: s.checks, fb: s.fb, chat, stuck: s.stuck, links: s.links, linksBy: s.linksBy || {}, submittedAt: s.submittedAt };
}

const filled = (v: unknown) => typeof v === "string" && v.trim() !== "";

// 제출 칸 하나 합치기: 최신 쪽이 비어 있으면 다른 쪽 것을 살린다
function mergeLinks(p: Partial<Links> = {}, o: Partial<Links> = {}): Links {
  return {
    repo: filled(p.repo) ? p.repo! : o.repo || p.repo || "",
    deploy: filled(p.deploy) ? p.deploy! : o.deploy || p.deploy || "",
    feature: filled(p.feature) ? p.feature : o.feature || p.feature || "",
    repoEdited: !!(p.repoEdited || o.repoEdited),
    submittedAt: Math.max(p.submittedAt || 0, o.submittedAt || 0) || null,
  };
}

// 두 노트를 칸별로 합친다. prefer 는 더 최신이라고 보는 쪽, other 는 나머지.
// 답·링크는 최신 쪽이 비어 있으면 다른 쪽 것을 살리고, 체크는 어느 쪽이든 된 건 된 걸로, 튜터 대화는 긴 쪽을 남긴다.
export function mergeNotes(prefer: Partial<Synced>, other: Partial<Synced>): Synced {
  const pa = prefer.ans || {};
  const oa = other.ans || {};
  const ans: Store["ans"] = {};
  for (const step of new Set([...Object.keys(pa), ...Object.keys(oa)])) {
    const p = pa[step] || {};
    const o = oa[step] || {};
    ans[step] = {};
    for (const q of new Set([...Object.keys(p), ...Object.keys(o)])) ans[step][q] = filled(p[q]) ? p[q] : (o[q] ?? p[q] ?? "");
  }

  const pc = prefer.checks || {};
  const oc = other.checks || {};
  const checks: Store["checks"] = {};
  for (const step of new Set([...Object.keys(pc), ...Object.keys(oc)])) {
    checks[step] = { ...(oc[step] || {}) };
    for (const [i, v] of Object.entries(pc[step] || {})) checks[step][Number(i)] = !!v || !!checks[step][Number(i)];
  }

  const fb: Record<string, Feedback> = { ...(other.fb || {}), ...(prefer.fb || {}) };

  const pchat = prefer.chat || {};
  const ochat = other.chat || {};
  const chat: Record<string, ChatMsg[]> = {};
  for (const step of new Set([...Object.keys(pchat), ...Object.keys(ochat)])) {
    const p = pchat[step] || [];
    const o = ochat[step] || [];
    chat[step] = o.length > p.length ? o : p;
  }

  const links = mergeLinks(prefer.links, other.links);
  const linksBy: Record<string, Links> = {};
  for (const sid of new Set([...Object.keys(prefer.linksBy || {}), ...Object.keys(other.linksBy || {})])) linksBy[sid] = mergeLinks(prefer.linksBy?.[sid], other.linksBy?.[sid]);

  return {
    name: filled(prefer.name) ? prefer.name! : other.name || "",
    tool: prefer.tool || other.tool || "",
    last: prefer.last || other.last || "setup",
    ans,
    checks,
    fb,
    chat,
    // 막힘 표시는 지금 상태라서 최신 쪽을 그대로 쓴다 (예전 막힘이 되살아나지 않게)
    stuck: prefer.stuck || other.stuck || {},
    links,
    linksBy,
    submittedAt: Math.max(prefer.submittedAt || 0, other.submittedAt || 0) || null,
  };
}

const getLS = (k: string) => {
  try {
    return localStorage.getItem(k) || "";
  } catch {
    return "";
  }
};
const setLS = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};
export const setSynced = (updatedAt: string) => setLS(SYNCED_KEY, updatedAt);

export async function fetchNotebook(): Promise<{ data: Partial<Synced> | null; updatedAt: string | null }> {
  const res = await fetch("/api/notebook", { headers: await authHeader(), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "노트를 불러오지 못했어요");
  return { data: json.data ?? null, updatedAt: json.updatedAt ?? null };
}

// 저장하고 서버 버전을 돌려준다. keepalive 는 창을 닫을 때 마지막으로 보내는 용도 (64KB 이하일 때만)
export async function saveNotebook(body: string, keepalive = false): Promise<string> {
  const res = await fetch("/api/notebook", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body,
    keepalive: keepalive && body.length < 60_000,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "노트를 저장하지 못했어요");
  return json.updatedAt as string;
}

// 로그인 직후: 이 브라우저 노트와 서버 노트를 칸별로 합친 결과
export function mergeOnLogin(local: Store, empty: Store, uid: string, server: { data: Partial<Synced> | null; updatedAt: string | null }): Store {
  const owner = getLS(OWNER_KEY);
  // 다른 계정이 쓰던 노트면 비우고 시작한다 (기기 설정과 지금 페이지만 남김)
  const mine = !owner || owner === uid;
  const base = mine ? local : { ...empty, os: local.os, osPicked: local.osPicked, cur: local.cur };
  setLS(OWNER_KEY, uid);
  if (!server.data) return base;
  // 서버가 이 브라우저가 마지막으로 맞춘 뒤로 바뀌었으면(다른 기기에서 썼거나, 이 브라우저가 처음이면) 서버가 최신
  const serverNewer = !mine || !getLS(SYNCED_KEY) || getLS(SYNCED_KEY) !== server.updatedAt;
  const localPart = syncedPart(base);
  const merged = serverNewer ? mergeNotes(server.data, localPart) : mergeNotes(localPart, server.data);
  return { ...base, ...merged };
}
