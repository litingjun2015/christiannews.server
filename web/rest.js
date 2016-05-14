var express = require('express');
var app = express();
var fs = require("fs");
var db = require('../config').db;
var debug = require('debug')('blog:web:rest');

var read = require('./read');

app.get('/listUsers', function (req, res) {
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log( data );
        res.end( data );
    });
})

app.get('/:id', function (req, res) {
    // First read existing users.
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        users = JSON.parse( data );
        var user = users["user" + req.params.id]
        console.log( user );
        res.end( JSON.stringify(user));
    });
})






var server = app.listen(8081, function () {

    //var host = server.address().address
    var host = '127.0.0.1';
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})