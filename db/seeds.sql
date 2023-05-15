USE employee_db;

INSERT INTO department (name) VALUES ('Sales'), ('Engineering'), ('Finance'), ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES
    ('Sales Manager', 100000, 1),
    ('Salesperson', 50000, 1),
    ('Software Engineer', 80000, 2),
    ('Lead Software Engineer', 120000, 2),
    ('Financial Analyst', 75000, 3),
    ('Marketing Manager', 90000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Michael', 'Scott', 1, null),
  ('Dwight', 'Schrute', 2, 1),
  ('Jim', 'Halpert', 3, 1),
  ('Pam', 'Beesly', 4, 1),
  ('Angela', 'Martin', 5, 2),
  ('Kevin', 'Malone', 6, 2),
  ('Oscar', 'Martinez', 7, 2),
  ('Ryan', 'Howard', 8, 1),
  ('Jan', 'Levinson', 9, null),
  ('Stanley', 'Hudson', 10, 1),
  ('Meredith', 'Palmer', 11, 2),
  ('Creed', 'Bratton', 12, 2),
  ('Kelly', 'Kapoor', 13, 3),
  ('Toby', 'Flenderson', 14, 1);
