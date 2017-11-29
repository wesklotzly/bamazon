DROP DATABASE IF EXISTS bamazon; 

CREATE database bamazon; 

USE bamazon; 

CREATE TABLE products (
  id int(7) auto_increment not null,
  product_name varchar(100) not null,
  department_name varchar(100) not null,
  price float(7, 2) not null,
  stock_quantity int(7) not null,
  PRIMARY KEY (id)
);

SELECT * FROM products;