const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
require("console.table");

init();

// Display logo text, load main prompts
function init() {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  loadMainPrompts();
}

function loadMainPrompts() {
  inquirer.prompt([
    {
      type: "list",
      name: "initialChoices",
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
    const{initialChoices} = answers;

      if(initialChoices === "View all departments"){
        viewDepartments();
      }

      if(initialChoices === "View all roles"){
        viewRoles();
      }
        
      if(initialChoices === "View all employees"){
        viewEmployees();
      }
      
      if(initialChoices === "View employees by department"){
        viewEmployeesByDepartment();
      }
      
      if(initialChoices === "View employees by manager"){
        viewEmployeesByManager();
      }

      if(initialChoices === "Add a department"){
        addDepartment();
      }
      
      if(initialChoices === "Add a role"){
        addRole();
      }
      
      if(initialChoices === "Add an employee"){
        addEmployee();
      }
      
      if(initialChoices === "Update an employee role"){
        updateEmployeeRole();
      }
      
      if(initialChoices === "Update employee manager"){
        updateEmployeeManager();
      }
      
      if(initialChoices === "Delete department"){
        deleteDepartment();
      }
      
      if(initialChoices === "Delete role"){
        deleteRole();
      }
      
      if(initialChoices === "Delete employee"){
        deleteEmployee();
      }
      
      if(initialChoices === "View department budget"){
        viewDepartmentBudget();
      }

      else {
        quit();
      }

    })
}

// View all Derpartments
function viewDepartments() {
  db.findAllDepartments()
    .then(([rows]) => {
      let departments = rows;
      console.log("\n");
      console.table(departments);
    })
  .then(() => loadMainPrompts());
}

// View all roles
function viewRoles() {
  db.findAllRoles()
    .then(([rows]) => {
      let roles = rows;
      console.log("\n");
      console.table(roles);
    })
  .then(() => loadMainPrompts());
}
    
// View all employees
function viewEmployees() {
  db.findAllEmployees()
  .then(([rows]) => {
    let employees = rows;
    console.log("\n");
    console.table(employees);
  })
  .then(() => loadMainPrompts());
}

// View all employees that belong to a department
function viewEmployeesByDepartment() {
  db.findAllDepartments()
  .then(([rows]) => {
      let departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));
      
      prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Which department would you like to see employees for?",
          choices: departmentChoices
        }
      ])
        .then(res => db.findAllEmployeesByDepartment(res.departmentId))
        .then(([rows]) => {
          let employees = rows;
          console.log("\n");
          console.table(employees);
        })
        .then(() => loadMainPrompts())
      });
}
    
// View all employees that report to a specific manager
function viewEmployeesByManager() {
  db.findAllEmployees()
  .then(([rows]) => {
    let managers = rows;
      const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));
      
      prompt([
        {
          type: "list",
          name: "managerId",
          message: "Which employee do you want to see direct reports for?",
          choices: managerChoices
        }
      ])
      .then(res => db.findAllEmployeesByManager(res.managerId))
      .then(([rows]) => {
        let employees = rows;
        console.log("\n");
        if (employees.length === 0) {
          console.log("The selected employee has no direct reports");
        } else {
          console.table(employees);
        }
      })
      .then(() => loadMainPrompts())
    });
}

// Add a department
function addDepartment() {
  prompt([
    {
      name: "name",
      message: "What is the name of the department?"
    }
  ])
  .then(res => {
    let name = res;
    db.createDepartment(name)
    .then(() => console.log(`Added ${name.name} to the database`))
    .then(() => loadMainPrompts())
  })
}

// Add a role
function addRole() {
  db.findAllDepartments()
    .then(([rows]) => {
      let departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt([
        {
          name: "title",
          message: "What is the name of the role?"
        },
        {
          name: "salary",
          message: "What is the salary of the role?"
        },
        {
          type: "list",
          name: "department_id",
          message: "Which department does the role belong to?",
          choices: departmentChoices
        }
      ])
      .then(role => {
        db.createRole(role)
        .then(() => console.log(`Added ${role.title} to the database`))
            .then(() => loadMainPrompts())
          })
    })
}

// Add an employee
function addEmployee() {
  prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      message: "What is the employee's last name?"
    }
  ])
    .then(res => {
      let firstName = res.first_name;
      let lastName = res.last_name;

      db.findAllRoles()
        .then(([rows]) => {
          let roles = rows;
          const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
          }));

          prompt({
            type: "list",
            name: "roleId",
            message: "What is the employee's role?",
            choices: roleChoices
          })
            .then(res => {
              let roleId = res.roleId;

              db.findAllEmployees()
                .then(([rows]) => {
                  let employees = rows;
                  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                  }));

                  managerChoices.unshift({ name: "None", value: null });

                  prompt({
                    type: "list",
                    name: "managerId",
                    message: "Who is the employee's manager?",
                    choices: managerChoices
                  })
                    .then(res => {
                      let employee = {
                        manager_id: res.managerId,
                        role_id: roleId,
                        first_name: firstName,
                        last_name: lastName
                      }

                      db.createEmployee(employee);
                    })
                    .then(() => console.log(
                      `Added ${firstName} ${lastName} to the database`
                    ))
                    .then(() => loadMainPrompts())
                })
            })
        })
    })
}

// Delete an employee
function deleteEmployee() {
    db.findAllEmployees()
    .then(([rows]) => {
      let employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

    prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: employeeChoices
      }
    ])
    .then(res => db.removeEmployee(res.employeeId))
    .then(() => console.log("Removed employee from the database"))
    .then(() => loadMainPrompts())
  })
}

// Update an employee's role
function updateEmployeeRole() {
  db.findAllEmployees()
    .then(([rows]) => {
      let employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee's role do you want to update?",
          choices: employeeChoices
        }
      ])
        .then(res => {
          let employeeId = res.employeeId;
          db.findAllRoles()
            .then(([rows]) => {
              let roles = rows;
              const roleChoices = roles.map(({ id, title }) => ({
                name: title,
                value: id
              }));

              prompt([
                {
                  type: "list",
                  name: "roleId",
                  message: "Which role do you want to assign the selected employee?",
                  choices: roleChoices
                }
              ])
              .then(res => db.updateEmployeeRole(employeeId, res.roleId))
              .then(() => console.log("Updated employee's role"))
              .then(() => loadMainPrompts())
            });
          });
        })
}
      
// Update an employee's manager
function updateEmployeeManager() {
  db.findAllEmployees()
    .then(([rows]) => {
      let employees = rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee's manager do you want to update?",
          choices: employeeChoices
        }
      ])
        .then(res => {
          let employeeId = res.employeeId
          db.findAllPossibleManagers(employeeId)
            .then(([rows]) => {
              let managers = rows;
              const managerChoices = managers.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
              }));

              prompt([
                {
                  type: "list",
                  name: "managerId",
                  message:
                    "Which employee do you want to set as manager for the selected employee?",
                  choices: managerChoices
                }
              ])
                .then(res => db.updateEmployeeManager(employeeId, res.managerId))
                .then(() => console.log("Updated employee's manager"))
                .then(() => loadMainPrompts())
            })
          })
    })
}

// Delete a role
function deleteRole() {
  db.findAllRoles()
    .then(([rows]) => {
      let roles = rows;
      const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
      }));

      prompt([
        {
          type: "list",
          name: "roleId",
          message:
            "Which role do you want to remove? (Warning: This will also remove employees)",
          choices: roleChoices
        }
      ])
        .then(res => db.removeRole(res.roleId))
        .then(() => console.log("Removed role from the database"))
        .then(() => loadMainPrompts())
    })
}



// Delete a department
function deleteDepartment() {
  db.findAllDepartments()
    .then(([rows]) => {
      let departments = rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      prompt({
        type: "list",
        name: "departmentId",
        message:
          "Which department would you like to remove? (Warning: This will also remove associated roles and employees)",
        choices: departmentChoices
      })
        .then(res => db.removeDepartment(res.departmentId))
        .then(() => console.log(`Removed department from the database`))
        .then(() => loadMainPrompts())
    })
}

// View all departments and show their total utilized department budget
function viewDepartmentBudget() {
  db.viewDepartmentBudgets()
    .then(([rows]) => {
      let departments = rows;
      console.log("\n");
      console.table(departments);
    })
    .then(() => loadMainPrompts());
}


// Exit the application
function quit() {
  console.log("Goodbye!");
  process.exit();
}
