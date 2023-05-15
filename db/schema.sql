Drop database if exists employee_db;
create database employee_db;
use employee_db;
create table department (
    id Int not null auto_increment Primary Key,
    name varchar(30)
);
create table role (
    id Int not null auto_increment Primary Key,
    title varchar(30),
    salary Decimal,
department_id Int not null,
foreign key (department_id)
references department(id)
);
create table employee (
    id Int not null auto_increment Primary Key,
    first_name varchar(30),
    last_name varchar(30),
    role_id Int not null,
    foreign key (role_id)
    references role(id),
    manager_id Int,
    foreign key (manager_id)
    references employee(id)
);
