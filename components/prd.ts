"use client";

import { authHeader } from "./supa";

// 소모임 PRD 올리기와 피드백 (서버: app/api/prd). 화면에는 계정 id 대신 "내 것인지"만 온다
export type Prd = { id: string; session: string; name: string; filename: string; content: string; version: number; created_at: string; updated_at: string; mine: boolean };
export type PrdComment = { id: string; prd_id: string; author: string; is_admin: boolean; section: string; version: number; body: string; created_at: string; mine: boolean };
export type PrdSummary = { id: string; session: string; name: string; filename: string; version: number; created_at: string; updated_at: string; comments: number };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", ...(await authHeader()), ...init.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "요청이 실패했어요");
  return json as T;
}

export const fetchMine = (session: string) =>
  call<{ admin: boolean; mine: Prd | null; comments: PrdComment[]; list: PrdSummary[] | null }>(`/api/prd?session=${encodeURIComponent(session)}`);
export const fetchPrd = (id: string) => call<{ admin: boolean; prd: Prd; comments: PrdComment[] }>(`/api/prd?id=${encodeURIComponent(id)}`);
export const uploadPrd = (body: { session: string; name: string; filename: string; content: string }) => call<{ prd: Prd }>("/api/prd", { method: "POST", body: JSON.stringify(body) });
export const postComment = (body: { prdId: string; section: string; body: string; name: string }) =>
  call<{ comment: PrdComment }>("/api/prd/comment", { method: "POST", body: JSON.stringify(body) });
export const removeComment = (id: string) => call<{ ok: true }>(`/api/prd/comment?id=${encodeURIComponent(id)}`, { method: "DELETE" });

export const PRD_MAX = 200_000;

// 현황판이나 알림에서 누른 기획서를 기획서 페이지가 바로 열게 한다
let pending: string | null = null;
export const PRD_FOCUS = "prd-focus";
export function focusPrd(id: string) {
  pending = id;
  window.dispatchEvent(new CustomEvent<string>(PRD_FOCUS, { detail: id }));
}
export const pendingPrd = () => pending;
export const clearPendingPrd = () => {
  pending = null;
};

// 운영진이 이미 읽은 기획서 버전 (이 브라우저에만). 새로 올라온 것에 표시를 붙이는 용도
const SEEN_KEY = "next-prd-seen";
export function readSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}
export function writeSeen(map: Record<string, number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {}
}

// 마크다운을 "## 제목" 단위 칸으로 나눈다. 칸 제목이 피드백을 다는 자리의 이름이 된다.
// 첫 ## 앞(# 제목 등)은 key "" 칸. 코드 블록 안의 ## 는 제목으로 보지 않는다
export function splitSections(md: string): { key: string; text: string }[] {
  const out: { key: string; text: string }[] = [{ key: "", text: "" }];
  let fence = "";
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    const f = line.match(/^\s*(```|~~~)/);
    if (f) fence = fence ? (line.trim().startsWith(fence) ? "" : fence) : f[1];
    const h = !fence && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h) out.push({ key: h[1].trim(), text: line + "\n" });
    else out[out.length - 1].text += line + "\n";
  }
  return out.filter((x) => x.key || x.text.trim());
}

export function ago(iso: string) {
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "방금";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return `${Math.floor(sec / 86400)}일 전`;
}
