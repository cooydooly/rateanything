-- =============================================
-- RateAnything - Supabase SQL Setup
-- Supabase > SQL Editor에서 실행하세요
-- =============================================

-- 1. users 테이블
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  created_at timestamptz default now()
);

-- 2. posts 테이블
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  username text not null,
  title text not null,
  review text,
  rating int check (rating between 1 and 5),
  avg_rating numeric(3,2) default 0,
  rating_count int default 1,
  likes int default 0,
  image_url text,
  created_at timestamptz default now()
);

-- 3. comments 테이블
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  username text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 4. RLS 비활성화 (개발용 — 배포 시 적절한 정책 추가 권장)
alter table users enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

create policy "allow all users" on users for all using (true) with check (true);
create policy "allow all posts" on posts for all using (true) with check (true);
create policy "allow all comments" on comments for all using (true) with check (true);

-- 5. Storage 버킷 (Supabase > Storage > New Bucket)
-- 이름: post-images
-- Public: true
