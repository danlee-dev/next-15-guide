"use client";

import type { AgentTool, OS } from "@/lib/content";

export type Verdict = "good" | "close" | "retry";
export type Feedback = { verdict: Verdict; feedback: string; next: string };
export type ChatMsg = { role: "user" | "assistant"; content: string };

export type Store = {
  name: string;
  os: OS;
  osPicked: boolean; // 사용자가 토글을 직접 눌렀으면 true. 아니면 열 때마다 기기를 보고 정한다
  tool: AgentTool | ""; // 주로 쓰는 AI 도구. 처음 이름 확인 때 고른다
  cur: string;
  last: string;
  ans: Record<string, Record<string, string>>;
  checks: Record<string, Record<number, boolean>>;
  fb: Record<string, Feedback>;
  chat: Record<string, ChatMsg[]>;
  stuck: Record<string, string>;
  links: Links; // Session 8 제출 칸 (예전부터 쓰던 자리라 그대로 둔다)
  linksBy?: Record<string, Links>; // 그 밖의 세션·소모임 회차 제출 칸 (세션 id 별)
  submittedAt: number | null;
};

export const EMPTY: Store = { name: "", os: "mac", osPicked: false, tool: "", cur: "home", last: "setup", ans: {}, checks: {}, fb: {}, chat: {}, stuck: {}, links: { repo: "", deploy: "" }, submittedAt: null };

const KEY = "next-s8-note-v1";

// 기기 OS로 명령어 토글 기본값을 정한다. Windows만 구분하면 되고 나머지(Mac, Linux, 폰)는 macOS 명령어로 둔다
export function detectOS(): OS {
  try {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const p = nav.userAgentData?.platform || navigator.platform || navigator.userAgent;
    return /win/i.test(p) ? "win" : "mac";
  } catch {
    return "mac";
  }
}

export function loadStore(): Store {
  let s = EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  return s.osPicked ? s : { ...s, os: detectOS() };
}

export function saveStore(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

// 튜터 요청 제한을 사람(브라우저) 단위로 세기 위한 랜덤 id. 이름이나 답과는 연결하지 않는다.
let memId = "";
export function clientId(): string {
  try {
    let id = localStorage.getItem(`${KEY}-cid`);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(`${KEY}-cid`, id);
    }
    return id;
  } catch {
    return (memId ||= Math.random().toString(36).slice(2));
  }
}

export type Patch = (fn: (s: Store) => Store) => void;

// 제출 칸 하나: 레포, 두 번째 링크(배포 주소나 PRD 링크), 한두 줄 설명
export type Links = { repo: string; deploy: string; feature?: string; repoEdited?: boolean; submittedAt?: number | null };
const NO_LINKS: Links = { repo: "", deploy: "" };

// 세션마다 제출 칸이 따로다. Session 8 은 예전 자리(links)를 쓴다
export const linksOf = (s: Store, sid: string): Links => (sid === "s8" ? s.links : s.linksBy?.[sid] || NO_LINKS);
export const withLinks = (s: Store, sid: string, l: Links): Store => (sid === "s8" ? { ...s, links: l } : { ...s, linksBy: { ...(s.linksBy || {}), [sid]: l } });

// 제출할 레포 주소. 제출 칸을 한 번이라도 고쳤으면 그 값(빈 값 포함)을 쓰고,
// 아니면 준비 단계에서 적은 답을 가져온다. 단 GitHub 주소처럼 생겼을 때만 (예전엔 "-" 같은 답도 끌려와서 지워도 다시 생겼다)
export function repoOf(s: Store, sid = "s8", from: { step: string; q: string } = { step: "setup", q: "repo" }): string {
  const l = linksOf(s, sid);
  if (l.repoEdited) return l.repo;
  if (l.repo) return l.repo;
  const fromStep = (s.ans[from.step]?.[from.q] || "").trim();
  return /github\.com\/[^/\s]+\/[^/\s]+/i.test(fromStep) ? fromStep : "";
}

export const VERDICT_LABEL: Record<Verdict, string> = { good: "통과", close: "거의 다 왔어요", retry: "한 번 더 생각해 봐요" };
