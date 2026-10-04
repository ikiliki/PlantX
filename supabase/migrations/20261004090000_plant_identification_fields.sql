-- Per-field provenance on a plant's identification (#35): for each class field the AI filled,
-- whether the owner kept or changed it, plus the AI's suggested option id for the passport tooltip.
-- Shape: { "<field>": { "check": "kept" | "changed", "aiValue"?: "<option id>" } }.

alter table plant_identifications add column fields jsonb;
