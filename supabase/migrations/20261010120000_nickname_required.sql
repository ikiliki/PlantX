-- Every grower has a public nickname ("Grower 4821"): generated at sign-up, editable, never empty.
-- Existing accounts without one get one now.

update users
set nickname = 'Grower ' || (1000 + floor(random() * 9000))::int
where nickname is null or btrim(nickname) = '';

alter table users alter column nickname set not null;

alter table users drop constraint users_nickname_len;
alter table users add constraint users_nickname_len check (char_length(btrim(nickname)) between 1 and 32);
