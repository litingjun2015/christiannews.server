var async = require('async');
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

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


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

app.get('/excuteSql/sql=:sql', function (req, res) {

    var sql = req.params.sql;

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

app.get('/listWechatUsers/start=:start_id&fetch=:fetch_num', function (req, res) {

    db.query('select * from user_wechat order by create_time LIMIT ?, ? ',
        [parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/listDeviceUsers/start=:start_id&fetch=:fetch_num', function (req, res) {

    db.query('SELECT uuid, count(*) page_view FROM `page_view` group by uuid order by page_view desc LIMIT ?, ? ',
        [parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/getDeviceUsersNum', function (req, res) {

    var sql = 'select count(*) num from (SELECT distinct uuid from page_view) a ';

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

app.get('/getComments/newsid=:newsid', function (req, res) {

    var sql = 'SELECT a.content, date_format(a.create_time,"%Y-%c-%d %H:%i:%s") create_time,b.nickname,b.headimgurl FROM comments a, user_wechat b' +
        ' where a.user_id = b.id and a.article_id = \''+req.params.newsid+ '\'';

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

app.get('/updatePageview/newsid=:newsid&uuid=:uuid', function (req, res) {

    // 查询用户是否已存在
    db.query('SELECT * FROM `page_view` WHERE `article_id`=? and `uuid` =? LIMIT 1',
        [req.params.newsid, req.params.uuid], function (err, data) {
            if (err)
            {
                res.end( err );
            }

            if (Array.isArray(data) && data.length >= 1) {
                // 已存在
                res.end("已存在: " + req.params.newsid + " " + req.params.uuid);

            } else {
                // 不存在，添加
                db.query('INSERT INTO `page_view`(`article_id`, `uuid`) VALUES (?, ? )',
                    [   req.params.newsid,
                        req.params.uuid ]);

                // update article_list set page_view = page_view+1 where id = '2078600'
                db.query('update `article_list` set page_view = page_view+1 where id = ? ',
                    [   req.params.newsid ]);

                res.end("添加: " + req.params.newsid + " " + req.params.uuid);
            }

        });

})

app.post('/addComment/', function (req, res) {

    console.log(req.body);

    db.query('INSERT INTO `comments`(`article_id`, `user_id`, `content`, `create_time`) VALUES (?, ?, ?, now())',
        [   req.body.article_id,
            req.body.user_id,
            req.body.content ], function (err, data) {
            if (err)
            {
                res.end( err );
            }

            res.end( JSON.stringify(data) );
        });

})

app.post('/addWechatuser/', function (req, res) {

    //console.log(req.body);

    // 查询用户是否已存在
    db.query('SELECT * FROM `user_wechat` WHERE `openid`=? LIMIT 1',
        [req.body.openid], function (err, data) {
            if (err)
            {
                res.end( err );
            }

            if (Array.isArray(data) && data.length >= 1) {
                // 用户已存在，更新一下
                db.query('UPDATE `user_wechat` SET `nickname`=?, `sex`=?, `province`=?, `city`=?, `country`=?, `headimgurl`=?, `privilege`=?, `unionid`=? WHERE `openid`=?',
                    [req.body.nickname,
                        req.body.sex,
                        req.body.province,
                        req.body.city,
                        req.body.country,
                        req.body.headimgurl,
                        req.body.privilege,
                        req.body.unionid,
                        req.body.openid]);
            } else {
                // 用户不存在，添加
                db.query('INSERT INTO `user_wechat`(`openid`, `nickname`, `sex`, `province`, `city`, `country`, `headimgurl`, `privilege`, `unionid`, `create_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now())',
                    [   req.body.openid,
                        req.body.nickname,
                        req.body.sex,
                        req.body.province,
                        req.body.city,
                        req.body.country,
                        req.body.headimgurl,
                        req.body.privilege,
                        req.body.unionid ]);
            }

        });


    db.query('SELECT id FROM `user_wechat` WHERE `openid`=? LIMIT 1',
        [req.body.openid], function (err, data) {
            if (err)
            {
                res.end( err );
            }

            res.end( JSON.stringify(data) );
        });

})

app.get('/getTagnameFromNewsid/newsid=:newsid', function (req, res) {

    var sql = 'SELECT category_name,name FROM `class_list` where id = (SELECT class_id FROM `article_list` ' +
        ' where id = '+req.params.newsid+ ' limit 1)';

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

app.get('/getTagnameFromid/tagid=:tagid', function (req, res) {

    var sql = 'SELECT name FROM `class_list` ' +
        ' where id = '+req.params.tagid;

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

app.get('/getArticleNum', function (req, res) {

    var sql = 'SELECT count(*) count FROM `article_list` ';

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

app.get('/getTagArticleNum/tagid=:tagid', function (req, res) {

    var sql = 'SELECT count(*) count FROM `article_list` ' +
        ' where class_id = '+req.params.tagid;

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

app.get('/taglistwithoutcategoryname', function (req, res) {

    db.query('SELECT name,id FROM `class_list` order by CAST(id AS UNSIGNED)' ,
        function (err, data) {
            if (err)
            {
                console.log( err );
            }

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/taglist', function (req, res) {

    var ret;
    async.series({
        one: function(callback){
            callback(null, 1);
        },
        two: function(callback){
            callback(null, 2);
        },

        ret_array: function(callback){

            var ret_array = [];

            async.waterfall([
                function(callback) {
                    db.query('SELECT DISTINCT category_name FROM class_list order by CAST(id AS UNSIGNED)',
                        function(err, rows){
                            callback(err, rows);
                        });
                },
                function(rows, callback){
                    var callbackRows = rows;
                    //console.log(callbackRows);
                    //async.eachSeries(callbackRows, function(row, key, callback){
                    async.eachSeries(callbackRows, function(row, callback){
                        var topics
                        //console.log('row.category_name: ', row.category_name);

                        var query = row.category_name
                        db.query('SELECT name,id FROM `class_list` WHERE `category_name`=? order by CAST(id AS UNSIGNED) ',
                            [query], function(err, rows){
                                //callbackRows[key].subTopics = rows;
                                //topics = callBackRows;
                                var tag = {};

                                tag.name = query;
                                tag.tree = rows;
                                //console.log(tag);
                                ret_array.push(tag);

                                //console.log('rows from async.forEach db query: ', rows);
                                //console.log("from inside asnyc.foreach", callbackRows);

                                //console.log("from inside asnyc.foreach", ret_array);
                                callback();
                         });
                    }, function(){
                        callback(null, ret_array);
                        //console.log('forEachOf callback called');
                    });
                    // console.log(topics);
                }
            ], function(err, topics){
                //console.log("from end of waterfall: ", ret_array);
                callback(null, ret_array);
            });

        }
    },function(err, results) {

        //results = {"one":1,"two":2,"ret_array":[[{"name":"litingjun"}],["tree":["1","2"]]]};
        //console.log("results:");
        //console.log(results.ret_array);
        //console.log(JSON.stringify(results.ret_array));

        res.end(JSON.stringify(results.ret_array));
    });

})

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

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/listLatestArticles/start=:start_id&fetch=:fetch_num', function (req, res) {

    db.query('SELECT * FROM `article_list` order by page_view desc,created_time desc,CAST(id AS UNSIGNED) desc LIMIT ?, ? ',
        [parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/getArticleMeta/id=:id', function (req, res) {

    db.query('SELECT * FROM `article_list` WHERE `id`=? limit 1',
        [req.params.id], function (err, data) {
            if (err)
            {
                console.log( err );
            }

            //console.log( data );
            res.end( JSON.stringify(data) );
        });

})

app.get('/listArticles/classid=:class_id&start=:start_id&fetch=:fetch_num', function (req, res) {

  db.query('SELECT * FROM `article_list` WHERE `class_id`=? order by CAST(id AS UNSIGNED) desc LIMIT ?, ? ',
      [req.params.class_id, parseInt(req.params.start_id), parseInt(req.params.fetch_num) ], function (err, data) {
        if (err)
        {
          console.log( err );
        }

        //console.log( data );
        res.end( JSON.stringify(data) );
      });

})

// rest
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

// 文章页面
app.get('/webarticle/:id', function (req, res, next) {
    // 通过 req.params.id 来取得 URL 中 :id 部分的参数
    read.article(req.params.id, function (err, article) {
        if (err) return next(err);

        // 渲染模板
        res.locals.article = article;

        //console.log(res);
        //console.log(res.locals);
        //console.log(article);
        //res.end( JSON.stringify(article) );
        res.render('article');
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