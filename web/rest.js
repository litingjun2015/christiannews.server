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

app.get('/listArticles/classid=:class_id&start=:start_id&fetch=:fetch_num', function (req, res) {

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


// 文章页面
app.get('/article/:id', function (req, res, next) {
    // 通过 req.params.id 来取得 URL 中 :id 部分的参数
    read.article(req.params.id, function (err, article) {
        if (err) return next(err);

        // 渲染模板
        res.locals.article = article;
        //console.log(article);
        res.end( JSON.stringify(article) );
        //res.render('article');
    });
});


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