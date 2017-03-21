var express = require('express')
var app = express();

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.get('/', function (req, res, next) {
    res.end("Now works with HTTPS!");
});

// var http = require("http");
// http.createServer(app).listen(3000, function(){
//     console.log('HTTP on port 3000');
// });

/* **********
*** HTTPS ***
************* */

// Generate a self-signed certificate
// openssl req -x509 -nodes -newkey rsa:4096 -keyout server.key -out server.crt
// Read the certificate 
// openssl x509 -in server.crt -text -noout

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3000');
});