-- Every other table already has row level security with no policies, so the Data API's anon and
-- authenticated roles see nothing. These two were created without it. The server connects as the
-- table owner and is not affected.
alter table catalog_suggestions enable row level security;
alter table issue_reports enable row level security;
