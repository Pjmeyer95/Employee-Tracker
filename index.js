const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Create connection to database
const connection = mysql.createConnection({
  host: 'localhost',
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
          'View all departments',
          'View all roles',
          'View all employees',
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
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
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

// Query database for all departments and display in table
const viewDepartments = () => {
  const query = `
    SELECT id AS 'Department ID', name AS 'Department Name'
    FROM departments
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

// Query database for all roles and display in table
const viewRoles = () => {
  const query = `
    SELECT roles.id AS 'Role ID', roles.title AS 'Title', departments.name AS 'Department', roles.salary AS 'Salary'
    FROM roles
    JOIN departments ON roles.department_id = departments.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
};

// Query database for all employees and display in table
const viewEmployees = () => {
  const query = `
    SELECT
      employees.id AS 'Employee ID',
      employees.first_name AS 'First Name',
      employees.last_name AS 'Last Name',
      roles.title AS 'Title',
      departments.name AS 'Department',
      roles.salary AS 'Salary',
      CONCAT(managers.first_name, ' ', managers.last_name) AS 'Manager'
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees managers ON employees.manager_id = managers.id
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
        validate: validateStringInput,
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        { name: answer.name },
        (err, res) => {
          if (err) throw err;
          console.log(`\n${answer.name} has been added to departments.\n`);
          init();
        }
      );
    });
}

// Function to add a role
function addRole() {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    const departments = res.map((department) => ({
      value: department.id,
      name: department.name,
    }));
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role?",
          validate: validateStringInput,
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary for the role?",
          validate: validateNumberInput,
        },
        {
          type: "list",
          name: "departmentId",
          message: "What department does the role belong to?",
          choices: departments,
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
            console.log(`\n${answer.title} has been added to roles.\n`);
            init();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    const roles = res.map((role) => ({
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
              validate: validateStringInput,
            },
            {
              type: "input",
              name: "lastName",
              message: "What is the employee's last name?",
              validate: validateStringInput,
            },
            {
              type: "list",
              name: "roleId",
              message: "What is the employee's role?",
              choices: roles,
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
                  `\n${answer.firstName} ${answer.lastName} has been added to employees.\n`
                );
                init();
              }
            );
          });
      }
    );
  });
}
