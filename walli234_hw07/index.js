// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

// create an express application
var app = express();

var path = require('path');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require('crypto');

// include the mysql module
var mysql = require('mysql');

var db = require('./db.js')

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// use express-session
// in memory session is sufficient for this assignment
app.use(session({
    secret: "csci4131secretkey",
    saveUninitialized: true,
    resave: false
}));

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/client/welcome.html'));
});

app.get('/getActiveUser', function(req, res) {
    res.send(req.session.name);
});

// // GET method route for the events page.
// It serves schedule.html present in client folder
app.get('/schedule', function(req, res) {
    if (req.session.views > 0) {
        console.log("You have valid credentials!");
        req.session.views += 1;
        res.sendFile(path.join(__dirname, '/client/schedule.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/admin', function(req, res) {
    if (req.session.views > 0) {
        console.log("You have valid credentials!");
        req.session.views += 1;
        res.sendFile(path.join(__dirname, '/client/admin.html'));
    } else {
        res.redirect('/login');
    }
});

// GET method route for the addEvents page.
// It serves addSchedule.html present in client folder
app.get('/addSchedule', function(req, res) {
    if (req.session.views > 0) {
        console.log("You have valid credentials!");
        req.session.views += 1;
        res.sendFile(path.join(__dirname, '/client/addSchedule.html'));
    } else {
        res.redirect('/login');
    }
});

//GET method for stock page
app.get('/stock', function(req, res) {
    if (req.session.views > 0) {
        console.log("You have valid credentials!");
        req.session.views += 1;
        res.sendFile(path.join(__dirname, '/client/stock.html'));
    } else {
        res.redirect('/login');
    }
});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login', function(req, res) {
    //Add Details
    res.sendFile(path.join(__dirname, '/client/login.html'));
});

// GET method to return the list of events
// The function queries the table events for the list of places and sends the response back to client
app.get('/getListOfEvents', function(req, res) {
    var sql = "SELECT * FROM tbl_events;";
    db.get().query(sql, function(err, rows) {
        if (err) throw err;
        res.send(rows);
    });
});

app.get('/getListOfUsers', function(req, res) {
    var sql = "SELECT acc_id, acc_name, acc_login FROM tbl_accounts;";
    db.get().query(sql, function(err, rows) {
        if (err) throw err;
        res.send(rows);
    });
});

app.post('/deleteUser', function(req, res) {
    if (req.session.name === req.body.acc_login) {
        res.send("error");
    } else {
        console.log(req.body.acc_login);
        var sql = `DELETE FROM tbl_accounts WHERE acc_login='${req.body.acc_login}';`;
        db.get().query(sql, function(err, rows) {
            if (err) throw err;
            res.send('OK');
        });
    }
});

// POST method to insert details of a new event to tbl_events table
app.post('/postEvent', function(req, res) {
    addScheduleEntry(req.body);
    res.redirect('/schedule');
});

function addScheduleEntry(reqBody) {
    var sql = `INSERT INTO tbl_events (event_name, event_location, event_day, event_start_time, event_end_time)
               VALUES ('${reqBody.eventName}', '${reqBody.location}', '${reqBody.date}', '${reqBody.stime}', '${reqBody.etime}');`;
    db.get().query(sql, function(err, rows) {
        if (err) throw err;
        console.log("Successfully inserted 1 row")
    });
}

// POST method to insert new user into tbl_accounts table
app.post('/postUser', function(req, res) {
    var validateQuery = `SELECT count(*) FROM tbl_accounts WHERE acc_login = '${req.body.acc_login}';`;
    db.get().query(validateQuery, function(err, results) {
        if (err) throw err;
        const count = Object.values(results[0])[0];
        console.log(`Num users is: ${count}`);
        if (count > 0) {
            //THere is already a users
            // throw new Error("This login is used by another user");
            res.send("error");
        } else {
            // insert a new tbl_account
            const hashedPass = crypto.createHash('sha256').update(req.body.acc_password).digest('base64')
            var insertQuery = ` INSERT INTO tbl_accounts (acc_name, acc_login, acc_password)
                                VALUES ('${req.body.acc_name}', '${req.body.acc_login}', '${hashedPass}');`;
            db.get().query(insertQuery, function(err, results) {
                if (err) throw err;
                console.log("Successfully inserted 1 row")
                res.send("OK");
                // res.redirect('/admin');
            });

        }
    });
});

app.post('/editUser', function(req, res) {
    var validateQuery = `SELECT count(*) FROM tbl_accounts WHERE acc_login = '${req.body.acc_login}';`;
    db.get().query(validateQuery, function(err, results) {
        if (err) throw err;
        const count = Object.values(results[0])[0];
        console.log(`Num users is: ${count}`);
        if (count > 0 && req.body.acc_login !== req.body.old_login) {
            //THere is already a user
            res.send("error");
        } else {
            // insert a new tbl_account
            const hashedPass = crypto.createHash('sha256').update(req.body.acc_password).digest('base64')
            var updateQuery = ` UPDATE tbl_accounts
                                SET acc_name = '${req.body.acc_name}', acc_login = '${req.body.acc_login}', acc_password = '${hashedPass}'
                                WHERE acc_login = '${req.body.old_login}'`;
            console.log(updateQuery);
            db.get().query(updateQuery, function(err, results) {
                if (err) throw err;
                console.log("Successfully updated 1 row");
                res.send("OK");
                // res.redirect('/admin');
            });

        }
    });
});

// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', (req, res) => {
    const hashedPass = crypto.createHash('sha256').update(req.body.password).digest('base64')
    var sql = `SELECT count(*) FROM tbl_accounts WHERE acc_login='${req.body.username}' AND acc_password='${hashedPass}';`;
    db.get().query(sql, function(err, results) {
        if (err) throw err;
        const count = Object.values(results[0])[0];
        console.log(`count is: ${count}`);
        if (count > 0) {
            req.session.views = 1;
            req.session.name = req.body.username;
            res.redirect('/schedule');
        } else {
            console.log("You entered invalid data. please try again.");
            res.sendFile(path.join(__dirname, '/client/failedLogin.html'));
        }
    });
});


// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
    res.status(404).send('404 Not found.');
});
