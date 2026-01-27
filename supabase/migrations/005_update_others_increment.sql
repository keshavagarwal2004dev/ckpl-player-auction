-- Update bid increment for the Others category to +5
UPDATE categories
SET increment = 5
WHERE LOWER(name) = 'others';
