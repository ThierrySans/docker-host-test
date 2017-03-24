var fs = require('fs');
var express = require('express')
var app = express();
var async = require('async');

// var MongoClient = require('mongodb').MongoClient;
// MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
//     if (err) console.log(err);
//     else console.log("Mongo database connected");
// });

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url);
    next();
});

var testFile = function(callback){
    fs.writeFile("/home/uploads/myFile.txt", "This text is from a local file!", function(err) {
        if (err) return callback("write: " + err.message, null);
        fs.readFile("/home/uploads/myFile.txt", function(err, res){
            if (err) return callback("read: " + err.message, null);
            return callback(null, res);
        });
    }); 
};

app.get('/', function (req, res, next) {
    var tasks = [];
    tasks.push(testFile);
    async.series(tasks, function(err, results){
        console.log(err);
        if (err) return res.status(500).end(err);
        results.push("And it works with HTTPS!");
        return res.end(results.join("\n"));
    });
});

var http = require("http");
http.createServer(app).listen(3000, function(){
    console.log('HTTP on port 3000');
});