var fs = require('fs');
var path = require('path');
var express = require('express')
var app = express();
var async = require('async');

if (app.get('env') === 'production'){ 
    var mongoServer = 'mongo';
    var redisServer = 'redis';
    var mysqlServer = 'mysql';
}else{
    var mongoServer = 'localhost';
    var redisServer = 'localhost';
    var mysqlServer = 'localhost';
}

/* **********
*** Mount ***
************* */

var file = path.join(__dirname, '../uploads/myFile.txt');

var testFile = function(callback){
    fs.writeFile(file, "This text is from a local file!", function(err) {
        if (err) return callback("write: " + err.message, null);
        fs.readFile(file, function(err, res){
            if (err) return callback("read: " + err.message, null);
            return callback(null, res);
        });
    }); 
};

/* ************
*** MongoDB ***
*************** */

// docker run --name mongo -p 27017:27017 -d mongo mongod --smallfiles
// persistence: -v /path/to/data:/data

var mongo = require('mongodb').MongoClient;
mongo.connect('mongodb://' + mongoServer + ':27017/test', function(err, db) {
    if (err) return console.log(err);
    console.log("Mongo database connected");
    collection = db.collection('test');
});

var testMongo = function(callback){
    collection.insert({key: "one", message: "This text is from MongoDB!"}, function(err, result) {
        if (err) return callback(err, null);
        collection.findAndModify({key: "one"}, [], {remove:true}, function(err, res) {
            if(err) return callback(err, null);
            return callback(null, res.value.message);
        });
    });
};

/* **********
*** MySQL ***
************* */

// docker run --name mysql -p 3306:3306 --env MYSQL_ROOT_PASSWORD=pass4root -d mysql
// persistence: -v /path/to/data:/var/lib/mysql

var mysql = require('mysql').createConnection({
  host     :  mysqlServer,
  user     : 'root',
  password : 'pass4root'
});

mysql.connect(function(err){
    if (err) return console.log(err);
    console.log("MySQL connected");
    var queries = [ 
        'CREATE DATABASE IF NOT EXISTS mydb', 
        'USE mydb',
        'CREATE TABLE IF NOT EXISTS collection (id INT(100) NOT NULL AUTO_INCREMENT, message TINYTEXT, PRIMARY KEY(id))'
    ];
    var run = function(query, callback){
        mysql.query(query, function(err, results){
            if (err) return callback(err);
            return callback(null);
        });
    };
    async.mapSeries(queries, run, function(err, res){
        if (err) return console.log(err);
        console.log("MySQL database ready");
    });
});

var testMySQL = function(callback){
    var post = {message: "This text is from MySQL!"};
    mysql.query('INSERT INTO collection SET ?', post, function(err, res) {
        if (err) return callback(err.message,null);
        mysql.query("DELETE FROM collection WHERE id = ? ", [res.insertId], function(err, res) {
            if (err) return callback(err.message,null);
            return callback(null, post.message);
        });
    });
};

/* **********
*** Redis ***
************* */

// docker run --name redis -p 6379:6379 -d redis redis-server --appendonly yes
// persistence: -v /path/to/data:/data

var redis = require('redis').createClient({host: redisServer});
redis.on('ready',function() {
     console.log("Redis database connected");  
})
redis.on('error',function(err) {
     console.log(err);
});

var testRedis = function(callback){
    redis.set('test', 'This text is from Redis!', function(err, reply) {
          if (err) return callback (err, null); 
          redis.get('test', function(err, res){
              if (err) return callback (err, null); 
              redis.del('test');
              callback(null, res); 
          });
    });
};

/* **********
*** Route ***
************* */

app.get('/', function (req, res, next) {
    var tasks = [];
    tasks.push(testFile);
    tasks.push(testMongo);
    tasks.push(testMySQL);
    tasks.push(testRedis);
    async.series(tasks, function(err, results){
        if (err) return res.status(500).end(err);
        results.push("And it works with HTTPS!");
        return res.end(results.join("\n"));
    });
});

var http = require("http");
http.createServer(app).listen(3000, function(){
    console.log('HTTP on port 3000');
});