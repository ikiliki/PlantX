-- Feed social: one 🌿 reaction per person per activity, and plain-text comments (soft delete for moderation).

create table activity_reactions (
  activity_id text not null references activities (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  created_at text not null,
  primary key (activity_id, user_id)
);

create index activity_reactions_user_idx on activity_reactions (user_id);

create table activity_comments (
  id text primary key,
  activity_id text not null references activities (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at text not null,
  deleted_at text
);

create index activity_comments_activity_idx on activity_comments (activity_id, created_at);
