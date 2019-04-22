
var mysql = require("mysql");
var crypto = require('crypto');

var con = mysql.createConnection({
  host: "cse-curly.cse.umn.edu",
  user: "C4131S19G117",
  password: "13719",
  database: "C4131S19G117",
  port: 3306
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected!");

  var rowToBeInserted = {
    acc_name: 'charlie',
    acc_login: 'charlie',
    acc_password: crypto.createHash('sha256').update("tango").digest('base64')
  };

  var sql = ``;
  con.query('INSERT tbl_accounts SET ?', rowToBeInserted, function(err, result) {
    if(err) {
      throw err;
    }
    console.log("Value inserted");
  });
});
