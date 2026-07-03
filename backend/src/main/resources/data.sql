INSERT INTO lemf_records (name, category, assigned_to, notes, status, created_at)
SELECT 'Alpha Request', 'Network', 'Asha', 'Seeded from MySQL', 'APPROVED', NOW()
WHERE NOT EXISTS (SELECT 1 FROM lemf_records WHERE name = 'Alpha Request');

INSERT INTO lemf_records (name, category, assigned_to, notes, status, created_at)
SELECT 'Beta Review', 'Security', 'Naren', 'Seeded from MySQL', 'PENDING', NOW()
WHERE NOT EXISTS (SELECT 1 FROM lemf_records WHERE name = 'Beta Review');
