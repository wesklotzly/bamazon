var mysql = require("mysql");
var inquirer = require("inquirer");

// connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "test",
  database: "bamazon"
});

// connect to
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  readProducts();
});

// display products, then call purchase prompt function
function readProducts() {
  console.log("Displaying all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // log products
    for (var i = 0; i < res.length; i++) {
      console.log("ID: " + res[i].id + "\nProduct Name: " + res[i].product_name + 
        "\nDepartment: " + res[i].department_name + "\nPrice: " + res[i].price + "\nAvailable Quantity: " + res[i].stock_quantity + "\n====================");
    }
    buyProducts(res);
  });
}
 
// purchase prompt, if product exists ask quantity
function buyProducts(products) {
  inquirer.prompt([
    {
      type: "input",
      message: "What product are you purchasing? (Enter product ID or e to exit application)",
      name: "productId",
      validate: function(res) {
        return !isNaN(res) || res.toLowerCase() === "e";
      }
    }    
  ]).then(function(res) {
    exitApplication(res.productId);

    var productId = parseInt(res.productId);
    var product = checkInventory(productId, products);
   
    // if product exists get quantity, else readproducts
    if (product) {
      getQuantity(product);
    } else {
      console.log("The item does not exist.");
      readProducts();
    }    
  });
}

function checkInventory(id, products) {
  for (var i = 0; i < products.length; i++ ) {
    if (products[i].id === id) {
      return products[i];
    } 
  }
  // if no product id
  return null;
}

// prompt user for quantity 
function getQuantity(product) {
  inquirer.prompt([
    {
      type: "input",
      message: "How many would you like to buy? (Enter e to exit)",
      name: "productQuantity",
      validate: function(res) {
        return res > 0 || res.toLowerCase() === "e";
      }
    }
  ]).then(function(res) {
    exitApplication(res.productQuantity);

    var quantity = parseInt(res.productQuantity);

    // check if quantity is available
    if (quantity > product.stock_quantity) {
      console.log("The quantity you have chosen is not available. We have " + product.stock_quantity + " " + product.product_name + "(s).\n" + " available.");
      readProducts();
    } else {
      updateStock(product, quantity);
    }
  });  
}

function updateStock(product, quantity) {
  var newQuantity = product.stock_quantity - quantity;
  connection.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [newQuantity, product.id], function(err, res) {
    console.log("Your order of " + quantity + " " + product.product_name + "(s) has been placed.\n");
    readProducts();
  });
}

function exitApplication(input) {
  if (input.toLowerCase() === "e") {
    console.log("Goodbye!.");
    process.exit(0);
  }
}
