"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 브라우저는 로그인만 한다 (공개 키). 데이터 읽기·쓰기는 서버가 secret 키로 한다
let client: SupabaseClient | null = null;

export function supa() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      // 주소의 #단계 와 겹치지 않게 ?code= 로 돌아오는 PKCE 방식
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

export async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supa().auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function signInWithGoogle() {
  return supa().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/` } });
}
