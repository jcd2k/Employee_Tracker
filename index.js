const { prompt } = require("inquirer");
const db = require("./db");
const cTable = require("console.table");
const connection = require("./config/connection")

// Load main prompts
connection.connect((error) => {
  if (error) throw error;

  console.log("Welcome to the Employee Management System");
  console.log("Created by Joshua Dominguez");

  loadMainPrompts();
});

function loadMainPrompts() {
  inquirer.prompt([
    {
      type: "list",
      name: "responses",
      message: "What would you like to do?",
        choices: [
          "View all departments", 
          "View all roles", 
          "View all employees", 
          "Add a department", 
          "Add a role", 
          "Add an employee", 
          "Update an employee role", 
          "Update employee manager",
          "View employees by manager",
          "View employees by department",
          "Delete departments",
          "Delete roles",
          "Delete employees",
          "View department budget"
        ],
      validate: choiceSelection => {
          if (choiceSelection) {
              return true;
          } else {
              return false;
          }
      }
    }
  ])
  .then((answers) => {
    const{responses} = answers;

      if(responses === "View all departments"){
        viewDepartments();
      }

      if(responses === "View all roles"){
        viewRoles();
      }
        
      if(responses === "View all employees"){
        viewEmployees();
      }
      
      if(responses === "View employees by department"){
        viewEmployeesByDepartment();
      }
      
      if(responses === "View employees by manager"){
        viewEmployeesByManager();
      }

      if(responses === "Add a department"){
        addDepartment();
      }
      
      if(responses === "Add a role"){
        addRole();
      }
      
      if(responses === "Add an employee"){
        addEmployee();
      }
      
      if(responses === "Update an employee role"){
        updateEmployeeRole();
      }
      
      if(responses === "Update employee manager"){
        updateEmployeeManager();
      }
      
      if(responses === "Delete department"){
        deleteDepartment();
      }
      
      if(responses === "Delete role"){
        deleteRole();
      }
      
      if(responses === "Delete employee"){
        deleteEmployee();
      }
      
      if(responses === "View department budget"){
        viewDepartmentBudget();
      }

      else {
        quit();
      }

    })
}

// List of Roles
function roles() {
  let roleArr = [];
  connection.query(
    "SELECT * FROM role", 
    function (err, data) {
    if (err) throw err;
    data.forEach((role) => {
      roleArr.push(role.title);
    });
  });
  return roleArr;
}

// List of Managers
function managers() {
  let managerArr = [];
  connection.query(
    `SELECT CONCAT (first_name, " ",  last_name) AS name FROM employee WHERE manager_id IS NULL`,
    function (err, data) {
    if (err) throw err;
    data.forEach((manager) => {
      managerArr.push(manager.name);
    });
  });
  return managerArr;
}

// View all Derpartments
function viewDepartments() {
  connection.query(
    'SELECT * FROM department',
    function (err,data) {
      if (err) throw err;
      cTable(data);
      loadMainPrompts();
    }
  );
}

// View all roles
function viewRoles() {
  connection.query(
    'SELECT role.id, role.title, department.department_name, role.salary FROM role LEFT JOIN department ON department.id = role.department_id ',
    function (err, data) {
      if (err) throw err;
      cTable(data);
      loadMainPrompts();
    }
  );
}
    
// View all employees
function viewEmployees() {
  connection.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
    CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    function (err, data) {
      if (err) throw err;
      cTable(data);
      loadMainPrompts();
    }
  );
}

// View all employees that belong to a department
function viewEmployeesByDepartment() {
  connection.query(
    `SELECT department.department_name AS Department, role.title AS 'Job Title', 
    employee.id, employee.first_name AS 'First Name', 
    employee.last_name AS 'Last Name'
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id);`,
  function(err, data) {
    if (err) throw err;
    cTable("\n All Employee Roles by Department\n", data, "\n");
    loadMainPrompts();
    }
  );
}
    
// View all employees that report to a specific manager
function viewEmployeesByManager() {
  connection.query(
    `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', 
    department.department_name AS 'Department', employee.id, employee.first_name AS 'First Name', 
    employee.last_name AS 'Last Name', role.title AS 'Job Title'
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
    INNER JOIN department ON (department.id = role.department_id);`,
  function(err, data) {
    if (err) throw err;
    cTable("\n All Employees under Manager \n", data, "\n");
    loadMainPrompts();
    }
  );
}

// Add a department
function addDepartment() {
  inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the department?",
      name: "addDepartment",
      validate: (data) => {
        if (!!data) {
          return console.log("\nPlease enter a valid department name\n");
        };
        console.log(`\nAdded ${data} to departments`)
        return true;
      }
    },
  ])
  .then(function (res) {
    connection.query(
      "INSERT INTO department SET ?",
      { department_name: res.department }, 
      function(err, data) {
      if (err) throw err;
      console.log(`${data.department} successfully added to departments\n`);
      loadMainPrompts();
    });
  });
}

// Add a role
function addRole() {
  inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Please enter the new role title:",
      validate: (data) => {
        if (!!data) {
          return console.log("\nPlease enter a valid role name\n");
        };
        console.log(`\nNew role, ${data}, added successfully to roles`)
        return true;
      }
    },
    {
      type: "input",
      name: "salary",
      message: "Please enter the salary for the new role:",
      validate: (data) => {
        if (!!data) {
          return console.log("\nPlease enter a valid salary\n");
        };
        console.log(`\nSalary of ${data} assigned`)
        return true;
      }
    },
    {
      name: "department",
      type: "list",
      message: "Which department will contain the new role?",
      choices: departmentList(),
    },
  ])
  .then((res) => {
    connection.query(
      `INSERT INTO role(title, salary, department_id) VALUES(?, ?, 
      (SELECT id FROM department WHERE department_name = ?));`,
      [res.title, res.salary, res.department],
      function (err, data) {
      if (err) throw err;
      console.log(`${data.title} succesfully added to roles\n`);
      loadMainPrompts();
    });
  });
}

// Add an employee
function addEmployee() {
  inquirer.prompt([
      {
        type: "input",
        name: "firstname",
        message: "What is the employee's first name?",
        validate: (data) => {
          if (!!data) {
            return console.log("\nPlease enter a valid first name\n");
          };
          console.log(`\nFirst name: ${data}`)
          return true;
        }
      },
      {
        type: "input",
        name: "lastname",
        message: "What is the employee's last name?",
        validate: (data) => {
          if (!!data) {
            return console.log("\nPlease enter a valid last name\n");
          };
          console.log(`\nLast name: ${data}`)
          return true;
        }
      },
      {
        name: "role",
        type: "list",
        message: "What is the employee's role? ",
        choices: roles(),
      },
      {
        name: "manager",
        type: "list",
        message: "Who is the employee's manager?",
        choices: managers(),
      },
    ])
    .then((data) => { 
      connection.query(
        `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES(?, ?, 
        (SELECT id FROM role WHERE title = ? ), 
        (SELECT id FROM (SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ? ) AS newtable))`,
        [data.firstname, data.lastname, data.role, data.manager],
        function (err, data) {
          if (err) throw err;
          cTable(`${(data.firstname, data.lastname)} succesfully added to employees\n`);
          loadMainPrompts();
        }
      );
    });
}
    
// Update an employee's role
function updateEmployeeRole() {
  let employeeArr = [];
  connection.query(
  `SELECT CONCAT (first_name," ",last_name) AS name FROM employee`,
  function (err, data) {
    if (err) throw err;
    data.forEach((employee) => {
      employeeArr.push(employee.name);
    });

    let roleArr = [];
    connection.query(
      "SELECT * FROM role", 
      function (err, data) {
      if (err) throw err;
      data.forEach((role) => {
        roleArr.push(role.title);
      });
    });

    inquirer.prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Please select the employee:",
          choices: employeeArr,
        },
        {
          name: "selectedRole",
          type: "list",
          message: "Please select their new role:",
          choices: roleArr,
        },
      ])
      .then((data) => { 
        connection.query(
          `UPDATE employee 
          SET role_id = (SELECT id FROM role WHERE title = ? ) 
          WHERE id = (SELECT id FROM(SELECT id FROM employee WHERE CONCAT(first_name," ",last_name) = ?) AS newtable)`,
          [data.selectedRole, data.selectedEmployee],
          function (err, data) {
            if (err) throw err;
            console.log(
              `${data.selectedEmployee}'s role updated to ${data.selectedRole}`
            );
            loadMainPrompts();
          }
        );
      });
  });
}
          
// Update an employee's manager
function updateEmployeeManager() {
  let employeeArr = [];
  connection.query(
    `SELECT CONCAT (first_name," ",last_name) AS name FROM employee`,
    function (err, data) {
    if (err) throw err;
    data.forEach((employee) => {
      employeeArr.push(employee.name);
    });
    inquirer.prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Which employee will receive a new manager?",
          choices: employeeArr,
        },
        {
          name: "newManager",
          type: "list",
          message: "Who is their new manager?",
          choices: employeeArr,
        },
      ])
      .then((data) => {
        let employeeId
        let managerId

        data.forEach((employee) => {
          if (
            data.selectedEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }

          if (
            data.newManager === `${employee.first_name} ${employee.last_name}`
          ) {
            managerId = employee.id;
          }
        });

        connection.query(
          `UPDATE employee SET manager_id = ? WHERE id = ?`,
          [managerId, employeeId], 
          function (err, employeeId) {
            if (err) throw err;
            console.log(`Employee ${employeeId} succesfully updated to Manager ${managerId}. \n`);
            loadMainPrompts();
          });
      });
  });
}

// Delete a department
function deleteDepartment() {

  connection.query(
    `SELECT * FROM department`,
    function (err, data) {
    if (err) throw err;

    const department = data.map(({ name, id }) => ({ name: name, value: id }));

    inquirer.prompt([
        {
          type: "list",
          name: "department",
          message: "What department do you want to delete?",
          choices: department,
        },
      ])
      .then((answer) => {
        const department = answer.department;

        connection.query(
          `DELETE FROM department WHERE id = ?`, department,
          function (err, department) {
          if (err) throw err;
          console.log(`${department.name} successfully deleted`);
          loadMainPrompts();
        });
      });
  });
}

// Delete a role
function deleteRole() {

  connection.query(
    `SELECT * FROM role`,
    function (err, data) {
    if (err) throw err;

    const role = data.map(({ title, id }) => ({ name: title, value: id }));

    inquirer.prompt([
        {
          type: "list",
          name: "role",
          message: "Which role would you like to delete?",
          choices: role,
        },
      ])
      .then((data) => {
        const role = data.role;

        connection.query(`DELETE FROM role WHERE id = ?`, role,
        function (err, role) {
          if (err) throw err;
          console.log(`${role.title} successfully deleted`);
          loadMainPrompts();
        });
      });
  });
}

// Delete an employee
function deleteEmployee() {

  connection.query(
    `SELECT * FROM employee`,
    function (err, data) {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer.prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to delete?",
          choices: employees,
        },
      ])
      .then((data) => {
        const employee = data.name; 

        connection.query(
          `DELETE FROM employee WHERE id = ?`, employee,
          function (err, employee) {
          if (err) throw err;
          console.log(`${employee.name} successfully deleted`);
          loadMainPrompts();
        });
      });
  });
}

// View a departments and show its total utilized department budget
function viewDepartmentBudget() {
  connection.query(
    'SELECT department.id, department.name, SUM(role.salary) AS utilized_budget FROM employee, LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id GROUP BY department.id, department.name',
    function (err, data) {
    if (err) throw err;
    console.table("\n Department budget: \n", data, "\n");
    loadMainPrompts();
  });
}

// Exits the application
function quit() {
  console.log("Goodbye!");
  process.exit();
}
