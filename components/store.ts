"use client";

import type { OS } from "@/lib/content";

export type Verdict = "good" | "close" | "retry";
export type Feedback = { verdict: Verdict; feedback: string; next: string };
export type ChatMsg = { role: "user" | "assistant"; content: string };

export type Store = {
  name: string;
  os: OS;
  cur: string;
  last: string;
  ans: Record<string, Record<string, string>>;
  checks: Record<string, Record<number, boolean>>;
  fb: Record<string, Feedback>;
  chat: Record<string, ChatMsg[]>;
  stuck: Record<string, string>;
};

export const EMPTY: Store = { name: "", os: "mac", cur: "setup", last: "setup", ans: {}, checks: {}, fb: {}, chat: {}, stuck: {} };

const KEY = "next-s8-note-v1";

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function saveStore(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export type Patch = (fn: (s: Store) => Store) => void;

export const VERDICT_LABEL: Record<Verdict, string> = { good: "통과", close: "거의 다 왔어요", retry: "한 번 더 생각해 봐요" };
