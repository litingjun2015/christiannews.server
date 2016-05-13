var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update');

debug('读取博文列表');


function readArticleList (url, callback) {
    // 读取分类页面
    request(url, function (err, res) {
        if (err) return callback(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());

        // 读取博文列表
        var articleList = [];
        //debug( $('.post') );

        var postKeyword = '.post';
        var titleKeyword = '.entry-title a';

        if(url == 'http://chinese.christianpost.com/')
        {
            postKeyword = '.entry-group-h';
            titleKeyword = '.entry-title-h a'
        }
        if(url == 'http://chinese.christianpost.com/opinion/')
        {
            postKeyword = '.opi-box-center-list-left';
            titleKeyword = '.entry-title-blue-opi a'

            $(postKeyword).each(function () {
                var $me = $(this);
                var $title = $me.find(titleKeyword);
                debug( $title.text() );
                debug( "http://chinese.christianpost.com" + $title.attr('href') );

                //var $time = $me.find('.atc_tm');
                var item = {
                    title: $title.text().trim(),
                    url:   "http://chinese.christianpost.com" + $title.attr('href'),
                    //time:  $time.text().trim()
                };
                // 从URL中取出文章的ID
                var s = item.url.match(/-([a-zA-Z0-9]+)/);
                if (Array.isArray(s)) {
                    item.id = s[1];
                    articleList.push(item);
                }
            });

            postKeyword = '.entry-title-blue-opi';
            titleKeyword = '.entry-title-blue-opi a'

            $(postKeyword).each(function () {
                var $me = $(this);
                var $title = $me.find(titleKeyword);
                debug( $title.text() );
                //debug( config.christianpost.url + $title.attr('href') );

                //var $time = $me.find('.atc_tm');
                var item = {
                    title: $title.text().trim(),
                    url:   "http://chinese.christianpost.com" + $title.attr('href'),
                    //time:  $time.text().trim()
                };
                // 从URL中取出文章的ID
                var s = item.url.match(/-([a-zA-Z0-9]+)/);
                if (Array.isArray(s)) {
                    item.id = s[1];
                    articleList.push(item);
                }
            });

            postKeyword = '.opi-box-center-list-right';
            titleKeyword = '.entry-title-blue-opi a'
        }



        $(postKeyword).each(function () {
            var $me = $(this);
            var $title = $me.find(titleKeyword);


            //console.log($title);
            debug( $title.text() );
            debug( "http://chinese.christianpost.com" + $title.attr('href') );

            //var $time = $me.find('.atc_tm');
            var item = {
                title: $title.text().trim(),
                url:   $title.attr('href'),
                //time:  $time.text().trim()
            };
            // 从URL中取出文章的ID
            var s = item.url.match(/-([a-zA-Z0-9]+)/);
            if (Array.isArray(s)) {
                item.id = s[1];
                articleList.push(item);
            }
        });

        // 检查是否有下一页
        var nextUrl = $('.SG_pgnext a').attr('href');
        if (nextUrl) {
            // 读取下一页
            readArticleList(nextUrl, function (err, articleList2) {
                if (err) return callback(err);

                // 合并结果
                callback(null, articleList.concat(articleList2));
            });
        } else {
            // 返回结果
            callback(null, articleList);
        }
    });
}

readArticleList('http://chinese.christianpost.com/opinion/', function (err, articleList) {
    if (err) console.error(err.stack);
    console.log(articleList);
});