
const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);


    if(req.url === '/'){
        indexPage(req,res);
    }
    else if(req.url === '/index.html'){
        indexPage(req,res);
    }
    else if(req.url === '/schedule.html'){
        schedule(req,res);    //request for schedule page
    }
    else if (req.url === '/stock.html') {
        stockPage(req, res); //stock page request
    }
    else if(req.url === '/addSchedule.html'){
        addSchedule(req,res);    //Form request
    }
    else if(req.url === '/getSchedule'){
        getSchedule(req,res); //Ajax request from schedule page
    }
    // Next route will get the data from the form and process it
    else if(req.url === '/postScheduleEntry') {
        var reqBody = '';
        // server starts receiving the form data
        req.on('data', function(data) {
            reqBody += data;

        });
        // server has received all the form data
        req.on('end', function() {
            addScheduleEntry(req, res, reqBody);
        });
    }
    else{

        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end(`404 Not Found`);
    }
}).listen(9001);


function indexPage(req, res) {
    fs.readFile('client/index.html', function(err, html) {
        if(err) {
            throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.write(html);
        res.end();
    });
}

function stockPage(req, res) {
    fs.readFile('client/stock.html', function (err, html) {
        if (err) {
            throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.write(html);
        res.end();
    });
}

function schedule(req, res) {
    fs.readFile('client/schedule.html', function(err, html) {
        if(err) {
            throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.write(html);
        res.end();
    });
}
function addSchedule(req, res) {
    fs.readFile('client/addSchedule.html', function(err, html) {
        if(err) {
            throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.write(html);
        res.end();
    });
}
function getSchedule(req, res) {
    fs.readFile("schedule.json", function(err, data) {
        if(err) {
            throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.write(data);
        res.end();
    });
}

function addScheduleEntry(req, res, reqBody) {
    const parsed = qs.parse(reqBody)
    fs.readFile('schedule.json', 'utf-8', function readFile(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        obj.schedule.push(parsed);
        json = JSON.stringify(obj);
        fs.writeFile('schedule.json', json, 'utf8', function (err) {
            if (err) throw err;
        })
    });
    fs.readFile('client/schedule.html', function(err, html) {
        if(err) {
            throw err;
        }
        res.statusCode = 302;
        res.setHeader('Content-type', 'text/html');
        res.write(html);
        res.end();
    });
}
