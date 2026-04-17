-- Données de test : employés
INSERT INTO team_members (full_name, role, color, contract_hours, active) VALUES
  ('Marie Dupont',    'Serveuse',   '#E879A0', 39, true),
  ('Thomas Martin',   'Cuisinier',  '#60A5FA', 39, true),
  ('Sophie Bernard',  'Manager',    '#34D399', 35, true)
ON CONFLICT DO NOTHING;

-- Données de test : shifts semaine du 13 au 19 avril 2026
INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-14', '11:00', '16:00', 'Fermeture midi', 30, '#E879A0'
FROM team_members WHERE full_name = 'Marie Dupont';

INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-14', '18:00', '23:00', 'Ouverture soir', 30, '#60A5FA'
FROM team_members WHERE full_name = 'Thomas Martin';

INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-15', '09:00', '15:00', 'Ménage + Salle', 30, '#34D399'
FROM team_members WHERE full_name = 'Sophie Bernard';

INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-15', '11:00', '16:00', 'Fermeture midi', 30, '#E879A0'
FROM team_members WHERE full_name = 'Marie Dupont';

INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-16', '09:00', '14:00', 'Ouverture', 0, '#60A5FA'
FROM team_members WHERE full_name = 'Thomas Martin';

INSERT INTO shifts (employee_id, date, start_time, end_time, label, break_minutes, color)
SELECT id, '2026-04-17', '10:00', '18:00', 'Repos', 0, '#e5e7eb'
FROM team_members WHERE full_name = 'Marie Dupont';
