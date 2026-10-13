-- 소모임 PRD 제출과 피드백. 학회원은 docs/PRD.md 파일을 올리고, 운영진이 칸(## 제목)마다 피드백을 단다.
-- 다시 올리면 같은 줄을 덮어쓰고 version 을 올린다. 피드백은 단 시점의 version 을 기억해서 "이전 버전에 단 것"을 구분한다.
create table if not exists public.prd (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,                 -- Supabase Auth 사용자 id
  session    text not null,                 -- lib/sessions.ts 의 회차 id (nb1 ...)
  name       text not null default '',      -- 올린 사람 이름 (노트의 이름)
  filename   text not null default '',
  content    text not null,                 -- 마크다운 원문
  version    integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session)
);

create table if not exists public.prd_comment (
  id         uuid primary key default gen_random_uuid(),
  prd_id     uuid not null references public.prd(id) on delete cascade,
  user_id    text not null,
  author     text not null default '',
  is_admin   boolean not null default false,
  section    text not null default '',      -- 칸 제목 ("2. 근거"). 전체 피드백은 '*'
  version    integer not null default 1,    -- 단 시점의 PRD 버전
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists prd_comment_prd_idx on public.prd_comment (prd_id, created_at);

-- board, notebook 과 같은 방식: RLS 켜고 정책 0개, 서버(secret 키)만 읽고 쓴다
alter table public.prd enable row level security;
alter table public.prd_comment enable row level security;
grant select, insert, update, delete on public.prd, public.prd_comment to service_role;
revoke all on public.prd, public.prd_comment from anon, authenticated;
