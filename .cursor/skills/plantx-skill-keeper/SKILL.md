---
name: plantx-skill-keeper
description: >-
  Maintain PlantX project skills and the skill router index. Use at the end of a
  task that added or changed a repeating pattern, or when skills drift from the
  code. Creates, updates, merges, or deletes skills and keeps the router in sync.
---

# PlantX skill keeper

## When to run

Run after a task that:

- Introduced a new repeating pattern the code itself cannot show.
- Moved code away from what a skill still describes.
- Duplicated or contradicted an existing skill.

## Rules

- Create a skill only for a pattern that **repeats** and that reading the code would miss.
- Keep each `SKILL.md` under about 60 lines. One term for one thing.
- Every project skill must appear in `.cursor/skills/plantx-skills/SKILL.md`.
- Keep `.cursor/rules/plantx-skill-router.mdc` pointing at the router only.
- Prefer updating or merging over adding near-duplicates.
- Delete a skill that no longer matches the repo, and remove it from the index.

## Steps

1. Diff what changed against the skill index.
2. Create, update, merge, or delete skills as needed.
3. Update the router index table.
4. Confirm the always-apply rule still says: read `plantx-skills` first.
