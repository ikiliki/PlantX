# Screens redesign: Home desktop, Feed social, Greenhouse shelves, Catalog grid, Passport tabs

Branch: `feature/screens-redesign` (from `feature/pp-password-login`, PR #127; merge master in once #127 lands).
Mockups: https://claude.ai/artifact/FjuBHFXmhxoecQHDhcVevo

## Goal

Second redesign round after partner feedback. Make the main screens clearer and more social without
changing navigation. Rank, Market, Tasks and navigation stay as they are. No "+" button in the dock.

## 1. Home on desktop (option A)

- Desktop (900px and up) gets the same daily Home as the phone (`HomeToday`) instead of the three
  columns with the endless feed: two columns. Start: greeting, today's care, your plants row.
  End: market, rank, feed preview (2 items + "Feed").
- `DiscoverPage` three-column layout and its rails are removed for signed-in members. Guests keep
  `GuestHomeIntro`, with the market and catalog rails beside it on desktop.
- No data change.

## 2. Feed: reactions and comments (option A, without Following)

- Every feed post gets a 🌿 react button with a count (toggle; one reaction per person per post)
  and a comment count. Tapping the comment count opens the post's comments: a sheet on the phone,
  inline under the post on desktop. Newest comments last; a text box at the bottom.
- Who can see and act: anyone signed in who can see the activity (`canSeeActivity`). Guests see
  counts, not the buttons (they stay behind the log-in card anyway).
- Deleting a comment: its author, the post's owner, or an admin. Deletion is soft (kept for
  moderation, hidden from everyone else).
- Comments are plain text, 1–500 characters, rate limited with the existing `rate_limits` table.
- The activity's owner sees reactions and comments on their own posts in the same places.
- Home's feed preview shows the counts but not the comment box.
- No Following / Everyone switch (no follow feature yet).

Data (migration):

```sql
create table activity_reactions (
  activity_id text not null references activities (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  created_at text not null,
  primary key (activity_id, user_id)
);

create table activity_comments (
  id text primary key,
  activity_id text not null references activities (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at text not null,
  deleted_at text
);
create index activity_comments_activity_idx on activity_comments (activity_id, created_at);
```

API (`server/src/features/feed/`): `POST/DELETE /api/activities/:id/reactions`,
`GET/POST /api/activities/:id/comments`, `DELETE /api/comments/:id`. The activities list returns
`reactions`, `reacted` (by me) and `comments` counts per activity. Mock mode mirrors it in
`src/mock/store.tsx`.

## 3. Greenhouse: clean cards on shelves

Cards:
- Plant cards lose the badges over the photo ("Water due", "Growing well", Manual / AI stamps) and the
  dashed green border. The photo is clean. One status line at the bottom with a small coloured dot:
  "Water today" / "Water in 3 days" / "Growing well" / "Photo check-in due". Overdue stays warm, the rest
  neutral. AI / Manual moves to the passport.

Shelves (a greenhouse-level entity, not a plant field):
- A grower names shelves (Balcony, Living room, Office…). A plant sits on at most one shelf.
- A Grid / Shelves switch next to the filters (remembered per device). Shelves view: one sideways
  row of clean cards per shelf, in shelf order, then "Not on a shelf". Grid view: today's grid.
- Manage shelves from the Shelves view: add, rename, reorder, delete (plants go back to
  "Not on a shelf"). Move a plant from its passport (Details tab, "Shelf" select) or from a card's menu
  in the Shelves view ("Move to…"). Drag and drop is out of scope.
- Shelves are private to the owner for now; a grower's public greenhouse shows the grid.
- Because shelves belong to the greenhouse, not the plant: when a plant changes owner (transfer or
  sale), its shelf placement is dropped and it lands in the new owner's "Not on a shelf".
- Filters (All / AI verified / Needs care / Upcoming) keep working in both views.

Data (migration):

```sql
create table shelves (
  id text primary key,
  owner_id text not null references users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  position integer not null,
  created_at text not null
);
create index shelves_owner_idx on shelves (owner_id, position);

create table shelf_plants (
  plant_id text primary key references plants (id) on delete cascade,
  shelf_id text not null references shelves (id) on delete cascade,
  position integer not null,
  placed_at text not null
);
create index shelf_plants_shelf_idx on shelf_plants (shelf_id, position);
```

The server checks that a plant and its shelf have the same owner, and deletes the `shelf_plants`
row wherever a plant's owner changes. API (`server/src/features/shelves/`): `GET/POST /api/shelves`,
`PATCH/DELETE /api/shelves/:id`, `PUT /api/plants/:id/shelf` (`{ shelfId | null }`).

## 4. Catalog: photo grid with care and rarity icons (option A + rarity)

- The catalog page becomes a search box, a rarity chip row (All, then each rarity) and a photo grid
  (2 columns phone, up to 5 wide). Each tile: photo, name, then three small icons: light, water, and
  rarity. Sorted by rarity (common first), then name.
- Tapping a tile opens the existing `CatalogPreview` sheet. Suggest a plant and Your suggestions stay
  at the top. Collapsed rarity lists and the contents table go.
- No data change.

## 5. Passport: header + Timeline · Details · Settings

- Header: photo, then name, species, grade and owner.
- Timeline tab (opens first): check-in photos on a dated line, with the plant's history entries
  between them, so you can see it grow.
- Details tab: lineage, market class, care info, AI / Manual identification, and the Shelf select
  (owner only).
- Settings tab: Public / Private and Delete (as today).
- No data change.

## Testing

- `npm run build` locally; e2e in the same commits: desktop Home daily view; react toggle and
  comment add / delete (comments are answered by route mocks on PP so tests leave no rows, or
  cleaned up); shelves create / move / delete and the Grid / Shelves switch; catalog grid sort and
  rarity filter; passport tabs.
- Guest checks stay `@prod`.

## Migrations

Two new files: `activity_social` (reactions, comments) and `shelves` (shelves, shelf_plants).
Applied to PlantX-PP when the branch is pushed; to production right before merging, after you
approve on PP.

## Out of scope

Following, drag-and-drop between shelves, public shelves, Tasks / Rank / Market changes, the "+" button.
