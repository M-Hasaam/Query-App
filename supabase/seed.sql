-- Seed some sample students
INSERT INTO students (id, roll_number, name, a1, a2, a3)
VALUES 
('i253107', '25I-3107', 'Ahmed Ali', 8.5, 7.0, 9.2),
('i254421', '25I-4421', 'Sara Khan', 9.0, 8.5, 10.0),
('i259900', '25I-9900', 'Zainab Fatima', 7.5, 6.0, 8.0)
ON CONFLICT (id) DO NOTHING;
