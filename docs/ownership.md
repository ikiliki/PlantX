# Plant ownership (planned)

Status: **not built.** Today a plant never changes hands: `plants.owner_id` is set on Add Plant and stays. This file is the agreed design for when the market (or a gift flow) moves a plant to someone else.

## Already true

- **One plant per passport.** A plant row is a single plant; there is no plant quantity (`20261010140000_one_plant_per_passport.sql`). Listings keep their own `quantity`.
- Before any transfer exists, the current owner took every photo, wrote every activity and added the plant. So the data below can be derived exactly when transfers ship; nothing needs recording ahead of time.

## Rule

The plant's story travels with the plant. What a person earned or wrote stays with that person.

| Thing | When the plant moves |
| --- | --- |
| Plant, community grades, AI verification, lineage (`parent_id`) | Move to the new owner |
| Photos | Move with the plant, each credited to who took it |
| The old owner's posts, likes, comments | Stay theirs and keep linking to the passport |
| The old owner's private rows (edited, scan) | Stay private to them; the passport says how many are hidden |
| Note / description, location area | Cleared; the new owner fills their own |
| Private flag | Reset to the new owner's default |
| Open care tasks | Closed for the old owner; the new owner gets a first watering |
| Active listing / offers | Closed |

## XP

- The old owner keeps all XP they earned (+50 for adding, +10 per care task). Selling never costs a level.
- The new owner gets **+50 once per plant** ("adopted"). Getting the same plant back later earns nothing, so trading back and forth never farms XP; buying back your own plant earns nothing.
- A reversed transfer (cancelled order) takes the adopted XP back; care the holder really did stays.

`greenhouseLevel()` then counts events (who added, who adopted, who completed care), not the plants someone owns today.

## Data to add with the transfer work

- `plant_owners (plant_id, owner_id, since, until, order_id)` — one row per stint; the passport timeline groups history into chapters from it. Backfill: one open row per plant from `owner_id`, `created_at`.
- `plant_photos.author_id`, `plant_photos.taken_at` — backfill from the plant's owner and `created_at`.

## Scenarios to cover

Full sale; order cancelled after handoff (reverse); buyer not on PlantX (release + claim code); plant died (ended, not deleted; keeps XP); round trip and buy-back; third owner and beyond; old owner deletes their account ("a former grower", photos kept unnamed, their posts removed); new owner makes it private (old posts link to "with a private grower"); new owner hides old photos from the gallery (kept in history); grades given before the move ("graded under …"); admin hides a plant mid-transfer (hold).

Out of scope for now: partial lots (one plant per passport), cuttings as a sale (a cutting is a new child plant).
