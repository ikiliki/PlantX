-- Members marked pre-approved can enter while the public app flag is off.

alter table users add column preapproved boolean not null default false;
