// establish connection to MYSQL database

var mysql = require("mysql");
var xml2js = require('xml2js');
var fs = require("fs");

var parser = new xml2js.Parser();

fs.readFile(__dirname + '/dbconfig.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        const config = result["dbconfig"];
        console.dir(config);
        console.log('Done');
        

        cnx = mysql.createConnection({
            host: config["host"][0],
            user: config["user"][0],
            password: config["password"][0],
            database: config["database"][0],
            port: config["port"][0]
        });
        cnx.connect(function(err) {
            if (err) {
                throw err;
            };
            console.log("Connected to MYSQL database!");
        });
        exports.get = function() {
          return cnx;
        }

    });

});
