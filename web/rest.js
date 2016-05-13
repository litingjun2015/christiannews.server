var express = require('express');
var app = express();
var fs = require("fs");
var db = require('../config').db;
var debug = require('debug')('blog:web:rest');

app.get('/listUsers', function (req, res) {
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log( data );
        res.end( data );
    });
})

app.get('/listArticles/:class_id/:start_id/:fetch_num', function (req, res) {

    db.query('SELECT * FROM `article_list` WHERE `class_id`=? LIMIT ?, ? ',
        [req.params.class_id, parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            console.log( data );
            res.end( JSON.stringify(data) );
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