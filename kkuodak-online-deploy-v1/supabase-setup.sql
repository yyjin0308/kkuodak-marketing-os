-- Supabase SQL Editor에서 1회 실행. 관리자 전용 API만 service_role 키를 사용합니다.
create table if not exists public.app_state (id integer primary key check(id=1), body jsonb not null, updated_at timestamptz not null default now());
alter table public.app_state enable row level security;
-- anon/authenticated 정책을 만들지 않으므로 브라우저에서 직접 접근 불가
insert into public.app_state (id,body) values (1, '{"projects":[],"designs":[],"rules":[{"id":"r1","text":"실제 제품 패키지 사진을 AI로 재생성하거나 왜곡하지 않는다.","date":"초기 기본 규칙"},{"id":"r2","text":"인스타그램 피드는 1080×1350(4:5) 비율로 제작한다.","date":"초기 기본 규칙"}],"brand":{"name":"꾸오닭","target":"2030 여성 다이어터, 운동 후 간식을 찾는 소비자","intro":"닭가슴살을 활용한 스낵 브랜드"},"chat":[]}'::jsonb) on conflict(id) do nothing;
