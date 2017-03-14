var express = require('express')
var app = express();

app.get('/', function (req, res, next) {
    res.end("hello world!");
});

var http = require("http");
http.createServer(app).listen(3000, function(){
    console.log('HTTP on port 3000');
});