var path = require('path');
var express = require('express');
var spawn = require('child_process').spawn;
var cronJob = require('cron').CronJob;
var read = require('./web/read');
var config = require('./config');
var db = require('./config').db;

var app = express();

// 配置 express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));


// 网站首页
app.get('/', function(req, res, next){
  // articleListByClassId 的第一个参数是文章分类的 ID
  // 第二个参数是返回结果的开始位置
  // 第三个参数是返回结果的数量
  read.articleListByClassId(2, 0, 20, function (err, list) {
    if (err) return next(err);

    // 渲染模板
    res.locals.articleList = list;
    res.render('index');
  });
});

// 文章页面
//app.get('/article/:id', function (req, res, next) {
//  // 通过 req.params.id 来取得 URL 中 :id 部分的参数
//  read.article(req.params.id, function (err, article) {
//    if (err) return next(err);
//
//    // 渲染模板
//    res.locals.article = article;
//    //console.log(article);
//    res.render('article');
//  });
//});

// rest api

app.get('/searchArticlesNum/keywordslist=:keywordslist', function (req, res) {

    var arr = req.params.keywordslist.split(" ");
    console.log(arr);

    var sql = 'SELECT count(*) num FROM `article_list` AS `A`' +
        ' LEFT JOIN `article_detail` AS `B` ON `A`.`id`=`B`.`id`' +
        ' WHERE 1=2 ';

    var condtion = '';
    for(var i = 0; i < arr.length;i++){
        condtion = condtion + ' or `A`.`title` like \'%' + arr[i] + '%\'' + ' or `B`.`content` like \'%' + arr[i] + '%\'';
    }
    sql = sql + condtion;

    console.log(sql);

    db.query(sql, function (err, data) {
            if (err)
            {
                console.log( err );
            }

            console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/searchArticles/keywordslist=:keywordslist&start=:start_id&fetch=:fetch_num', function (req, res) {

    var arr = req.params.keywordslist.split(" ");
    console.log(arr);

    var sql = 'SELECT * FROM `article_list` AS `A`' +
        ' LEFT JOIN `article_detail` AS `B` ON `A`.`id`=`B`.`id`' +
        ' WHERE 1=2 ';

    var condtion = '';
    for(var i = 0; i < arr.length;i++){
        condtion = condtion + ' or `A`.`title` like \'%' + arr[i] + '%\'' + ' or `B`.`content` like \'%' + arr[i] + '%\'';
    }
    sql = sql + condtion + ' LIMIT ?, ? ';

    console.log(sql);

    db.query(sql,
        [parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/listArticles/classid=:class_id&start=:start_id&fetch=:fetch_num', function (req, res) {

  db.query('SELECT * FROM `article_list` WHERE `class_id`=? order by id desc LIMIT ?, ? ',
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

app.listen(config.port);
console.log('服务器已启动');


// 定时执行更新任务
//var job = new cronJob(config.autoUpdate, function () {
//  console.log('开始执行定时更新任务');
//  var update = spawn(process.execPath, [path.resolve(__dirname, 'update/all.js')]);
//  update.stdout.pipe(process.stdout);
//  update.stderr.pipe(process.stderr);
//  update.on('close', function (code) {
//    console.log('更新任务结束，代码=%d', code);
//  });
//});
//job.start();


process.on('uncaughtException', function (err) {
  console.error('uncaughtException: %s', err.stack);
})