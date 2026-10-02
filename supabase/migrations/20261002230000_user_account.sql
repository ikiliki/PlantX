-- Private nickname and the public avatar icon. The seed is the default face.
alter table users add column nickname text;
alter table users add column avatar_icon text not null default 'seed';

alter table users add constraint users_nickname_len check (nickname is null or char_length(nickname) <= 32);
