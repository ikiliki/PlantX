-- One plant per passport: a plant row is a single plant, never a lot of ×N.
-- Listings keep their own quantity for the market.

alter table plants drop column quantity;
