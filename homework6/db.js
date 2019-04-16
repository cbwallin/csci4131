// establish connection to MYSQL database

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "cse-curly.cse.umn.edu",
  user: "C4131S19GXXX",
  password: "XXXX",
  database: "C4131S19GXXX",
  port: 3306
});

connection.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected to MYSQL database!");
});

// export the connection
exports.get = function() {
  return connection;
}
