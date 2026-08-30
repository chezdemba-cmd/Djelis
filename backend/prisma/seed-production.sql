BEGIN;

INSERT INTO categories (name, slug, "isActive")
VALUES
  ('DjaaSoo (Vidéo)', 'djaasoo', TRUE),
  ('DjeliSon (Audio)', 'djelison', TRUE)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, "isActive" = TRUE;

INSERT INTO genres ("categoryId", name, slug)
SELECT c.id, values_to_add.name, values_to_add.slug
FROM categories c
JOIN (
  VALUES
    ('djaasoo', 'Cinéma', 'cinema'),
    ('djaasoo', 'Séries', 'series'),
    ('djelison', 'Musique', 'musique'),
    ('djelison', 'Podcasts', 'podcasts')
) AS values_to_add(category_slug, name, slug)
  ON values_to_add.category_slug = c.slug
ON CONFLICT ("categoryId", name) DO UPDATE
SET slug = EXCLUDED.slug;

INSERT INTO plans (name, "durationDays", "priceFcfa", "priceEuro", "isActive")
SELECT 'Pass Jour', 1, 150, 0.25, TRUE
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pass Jour');

INSERT INTO plans (name, "durationDays", "priceFcfa", "priceEuro", "isActive")
SELECT 'Pass Week-end', 3, 350, 0.50, TRUE
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pass Week-end');

INSERT INTO plans (name, "durationDays", "priceFcfa", "priceEuro", "isActive")
SELECT 'Pass Mois', 30, 2000, 4.99, TRUE
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pass Mois');

UPDATE plans
SET
  "durationDays" = CASE name
    WHEN 'Pass Jour' THEN 1
    WHEN 'Pass Week-end' THEN 3
    WHEN 'Pass Mois' THEN 30
  END,
  "priceFcfa" = CASE name
    WHEN 'Pass Jour' THEN 150
    WHEN 'Pass Week-end' THEN 350
    WHEN 'Pass Mois' THEN 2000
  END,
  "priceEuro" = CASE name
    WHEN 'Pass Jour' THEN 0.25
    WHEN 'Pass Week-end' THEN 0.50
    WHEN 'Pass Mois' THEN 4.99
  END,
  "isActive" = TRUE
WHERE name IN ('Pass Jour', 'Pass Week-end', 'Pass Mois');

COMMIT;
