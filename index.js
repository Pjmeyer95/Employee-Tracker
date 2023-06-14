const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Create connection to database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'employee_db'
});

// Connect to database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
  start();
});

// Prompt user for action to take
const start = () => {
  inquirer
    .prompt([
      {
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View all department',
          'View all role',
          'View all employee',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      }
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View all department':
          viewdepartment();
          break;
        case 'View all role':
          viewrole();
          break;
        case 'View all employee':
          viewemployee();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          connection.end();
          break;
        default:
          console.log(`Invalid action: ${answer.action}`);
          start();
      }
    });
};

// Query database for all department and display in table
const viewdepartment = () => {
  const query = `
    SELECT *
    FROM department
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

// Query database for all role and display in table
const viewrole = () => {
  const query = `
    SELECT role.id AS 'Role ID', role.title AS 'Title', department.name AS 'Department', role.salary AS 'Salary'
    FROM role
    JOIN department ON role.department_id = department.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

// Query database for all employee and display in table
const viewemployee = () => {
  const query = `
    SELECT
      employee.id AS 'Employee ID',
      employee.first_name AS 'First Name',
      employee.last_name AS 'Last Name',
      role.title AS 'Title',
      department.name AS 'Department',
      role.salary AS 'Salary',
      CONCAT(managers.first_name, ' ', managers.last_name) AS 'Manager'
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee managers ON employee.manager_id = managers.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

// Prompt user to enter department name and add department to database
// Function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department?",
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        { name: answer.name },
        (err, res) => {
          if (err) throw err;
          console.log(`\n${answer.name} has been added to department.\n`);
          start();
        }
      );
    });
}

// Function to add a role
function addRole() {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    const department = res.map((department) => ({
      value: department.id,
      name: department.name,
    }));
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary for the role?",
        },
        {
          type: "list",
          name: "departmentId",
          message: "What department does the role belong to?",
          choices: department,
        },
      ])
      .then((answer) => {
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentId,
          },
          (err, res) => {
            if (err) throw err;
            console.log(`\n${answer.title} has been added to role.\n`);
            start();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    const role = res.map((role) => ({
      value: role.id,
      name: role.title,
    }));
    connection.query(
      "SELECT * FROM employee WHERE manager_id IS NULL",
      (err, res) => {
        if (err) throw err;
        const managers = res.map((manager) => ({
          value: manager.id,
          name: `${manager.first_name} ${manager.last_name}`,
        }));
        inquirer
          .prompt([
            {
              type: "input",
              name: "firstName",
              message: "What is the employee's first name?",
            },
            {
              type: "input",
              name: "lastName",
              message: "What is the employee's last name?",
            },
            {
              type: "list",
              name: "roleId",
              message: "What is the employee's role?",
              choices: role,
            },
            {
              type: "list",
              name: "managerId",
              message: "Who is the employee's manager?",
              choices: [
                ...managers,
                {
                  value: null,
                  name: "None",
                },
              ],
            },
          ])
          .then((answer) => {
            connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.roleId,
                manager_id: answer.managerId,
              },
              (err, res) => {
                if (err) throw err;
                console.log(
                  `\n${answer.firstName} ${answer.lastName} has been added to employee.\n`
                );
                start();
              }
            );
          });
      }
    );
  });
}
// Update a Current employee
const updateEmployeeRole = () => {
	const sqlQuery = 'SELECT id, first_name, last_name, role_id FROM employee';
	connection.query(sqlQuery, function (error, results) {
		if (error) throw error;
		const employees = results.map(employee => ({
			name: `${employee.first_name} ${employee.last_name}`,
			value: employee.id,
		}));
		employees.unshift({
			name: 'None',
			value: null,
		});
    inquirer
			.prompt([
				{
					type: 'list',
					name: 'id',
					message: "Which employee's role do you want to update?",
					choices: employees,
				},
			])
			.then(({ id }) => {
				const roleQuery = 'SELECT * FROM role';
				connection.query(roleQuery, function (error, results) {
					if (error) throw error;
					console.log(results);
					const roles = results.map(result => ({
						name: result.title,
						value: result.id,
					}));

					inquirer
						.prompt([
							{
								type: 'list',
								name: 'role_id',
								message: 'Which is the new role for this employee employee?',
								choices: roles,
							},
						])
						.then(({ role_id }) => {
							const updateQuery = `UPDATE employee SET ? WHERE id = ${id}`;
							connection.query(updateQuery, { role_id }, function (error, results) {
								if (error) throw error;
								console.log("Updated employee's role");
								connection.end();
							});
						});
				});
			});
	});
};