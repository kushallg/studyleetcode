-- Run this in the Supabase SQL editor.
-- Single-user app, no auth, RLS disabled.

create table if not exists problems (
  id text primary key,
  title text not null,
  leetcode_url text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  pattern text not null,
  source text not null check (source in ('neetcode150', 'blind75', 'both')),
  interleave_group int not null
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  problem_id text references problems(id),
  attempted_at timestamptz not null default now(),
  struggled boolean not null,
  personal_difficulty text not null check (personal_difficulty in ('Easy', 'Medium', 'Hard')),
  active_recall_question text not null,
  active_recall_answer text,
  is_review boolean not null default false
);

create index if not exists attempts_problem_id_idx on attempts(problem_id);
create index if not exists attempts_attempted_at_idx on attempts(attempted_at);

alter table problems disable row level security;
alter table attempts disable row level security;
