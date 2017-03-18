var express = require('express')
var app = express();

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.get('/', function (req, res, next) {
    res.end("It works and it gets updated!");
});

var http = require("http");
http.createServer(app).listen(3000, function(){
    console.log('HTTP on port 3000');
});