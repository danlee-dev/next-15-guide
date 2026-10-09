"use client";

import type { OS } from "@/lib/content";

export type Verdict = "good" | "close" | "retry";
export type Feedback = { verdict: Verdict; feedback: string; next: string };
export type ChatMsg = { role: "user" | "assistant"; content: string };

export type Store = {
  name: string;
  os: OS;
  osPicked: boolean; // 사용자가 토글을 직접 눌렀으면 true. 아니면 열 때마다 기기를 보고 정한다
  cur: string;
  last: string;
  ans: Record<string, Record<string, string>>;
  checks: Record<string, Record<number, boolean>>;
  fb: Record<string, Feedback>;
  chat: Record<string, ChatMsg[]>;
  stuck: Record<string, string>;
  links: { repo: string; deploy: string }; // 제출 현황판에 걸 링크
  submittedAt: number | null;
};

export const EMPTY: Store = { name: "", os: "mac", osPicked: false, cur: "setup", last: "setup", ans: {}, checks: {}, fb: {}, chat: {}, stuck: {}, links: { repo: "", deploy: "" }, submittedAt: null };

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

export const VERDICT_LABEL: Record<Verdict, string> = { good: "통과", close: "거의 다 왔어요", retry: "한 번 더 생각해 봐요" };
