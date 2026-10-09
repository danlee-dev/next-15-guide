-- 실습 노트 제출 현황판: 학회원 한 명(브라우저 하나)당 한 줄.
-- Supabase SQL Editor에 붙여넣거나 psql로 실행한다. 여러 번 실행해도 안전하다.

create table if not exists public.board (
  client_id    text primary key,          -- 브라우저마다 만든 랜덤 id. 현황판 API로 내보내지 않는다
  name         text not null,             -- 본명
  cur          text,                      -- 지금 보고 있는 단계 id
  done         int  not null default 0,   -- 끝낸 단계 수
  total        int  not null default 7,
  stuck        text,                      -- "막혔어요"에 적은 한 줄 (없으면 null)
  repo_url     text,
  deploy_url   text,
  submitted_at timestamptz,               -- 링크를 처음 제출한 시각
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 주로 쓰는 AI 도구 (2026-10-10 추가)
alter table public.board add column if not exists tool text check (tool in ('claude', 'codex'));
-- 과제로 추가한 기능 설명 (2026-10-10 추가)
alter table public.board add column if not exists feature text;

create index if not exists board_updated_at_idx on public.board (updated_at desc);

-- 실습 앱과 같은 방식: RLS를 켜고 정책은 0개. publishable 키로는 못 읽고, 서버(secret 키)만 읽고 쓴다.
alter table public.board enable row level security;
grant select, insert, update, delete on public.board to service_role;

-- 이 프로젝트는 새 테이블에 anon/authenticated 권한이 자동으로 붙는다. RLS로 막히지만 이중으로 회수해 둔다.
revoke all on public.board from anon, authenticated;
