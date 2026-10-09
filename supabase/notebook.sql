-- 실습 노트 전체(체크, 답, 튜터 대화, 제출 링크)를 계정별로 저장한다.
-- 브라우저 저장소만 쓰면 주소(도메인)나 기기가 바뀔 때 노트가 비어서, 로그인하면 여기서 다시 불러온다.
create table if not exists public.notebook (
  client_id  text primary key,              -- Supabase Auth 사용자 id
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- board 와 같은 방식: RLS 켜고 정책 0개, 서버(secret 키)만 읽고 쓴다
alter table public.notebook enable row level security;
grant select, insert, update, delete on public.notebook to service_role;
revoke all on public.notebook from anon, authenticated;
