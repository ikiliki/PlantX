-- Who suggested a catalog entry and how. `identify` rows come from a scan that matched no category;
-- `member` rows come from the Catalog form. Everyone in `suggested_by` sees the entry as pending in
-- their Catalog until an admin adds or declines it. `note` is what the member wrote for the admin.

alter table catalog_suggestions
  add column suggested_by text[] not null default '{}',
  add column origin text not null default 'identify' check (origin in ('identify', 'member')),
  add column note text not null default '';
