-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Polls
create table polls (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  created_at timestamptz not null default now(),
  author_id uuid references auth.users on delete set null
);

-- Options
create table options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  image text,
  color text
);

-- Votes (one per user per poll)
create table votes (
  poll_id uuid not null references polls on delete cascade,
  option_id uuid not null references options on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  voted_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

-- RLS
alter table polls enable row level security;
alter table options enable row level security;
alter table votes enable row level security;

create policy "polls: public read" on polls for select using (true);
create policy "polls: auth insert" on polls for insert with check (auth.uid() = author_id);

create policy "options: public read" on options for select using (true);
create policy "options: auth insert" on options for insert with check (
  exists (select 1 from polls where id = poll_id and author_id = auth.uid())
);

create policy "votes: public read" on votes for select using (true);
create policy "votes: auth insert" on votes for insert with check (
  auth.uid() = user_id and
  exists (
    select 1 from polls
    where id = poll_id
    and extract(epoch from (now() - created_at)) < 1800
  )
);
create policy "votes: auth update own" on votes for update using (
  auth.uid() = user_id and
  exists (
    select 1 from polls
    where id = poll_id
    and extract(epoch from (now() - created_at)) < 1800
  )
);
create policy "votes: auth delete own" on votes for delete using (auth.uid() = user_id);

-- Max 20 options per poll
create or replace function check_options_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from options where poll_id = NEW.poll_id) >= 20 then
    raise exception 'Poll cannot have more than 20 options';
  end if;
  return NEW;
end;
$$;

create trigger enforce_options_limit
before insert on options
for each row execute function check_options_limit();

-- Realtime
alter publication supabase_realtime add table votes;
alter table votes replica identity full;
