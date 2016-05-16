var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update');
var config = require('../config');

debug('读取博文列表');


exports.articleList = function (url, callback) {
    debug('读取博文列表：%s', url);

    // 读取分类页面
    request(url, function (err, res) {
        if (err) return callback(err);

        // 根据网页内容创建DOM操作对象
        var $ = cheerio.load(res.body.toString());
        //var $ = cheerio.load('<ul id="mainBody">...</ul>');

        // 读取博文列表
        var articleList = [];
        //debug( $('.post') );

        var postKeyword = '#mainBody li';
        var titleKeyword = 'a';
        var thumbKeyword = '.summary img';
        var authorKeyword = '.author a'

        if(url == 'http://chinese.christianpost.com/')
        {
            postKeyword = '.entry-group-h';
            titleKeyword = '.entry-title-h a'
            thumbKeyword = '.entry-content-h img';
            authorKeyword = '.entry-byline-h a'
        }

        if(url == 'http://chinese.christianpost.com/opinion/')
        {
            postKeyword = '.opi-box-center-list-left';
            titleKeyword = '.entry-title-blue-opi a'
            thumbKeyword = '.opi-box-center-list-left img';
            authorKeyword = '.byline a'

            $(postKeyword).each(function () {
                var $me = $(this);
                var $title = $me.find(titleKeyword);
                var $thumb = $me.find(thumbKeyword);
                var $author = $me.find(authorKeyword);
                debug( $title.text() );
                debug( config.christianpost.murl + $title.attr('href') );


                //console.log("---------------------");
                //debug( $me );
                //console.log( thumbKeyword );
                //console.log( $thumb );
                //console.log("---------------------");

                //var $time = $me.find('.atc_tm');
                var item = {
                    title: $title.text().trim(),
                    url:   config.christianpost.murl + $title.attr('href'),
                    thumb: $thumb.attr('src'),
                    author: $author.text().trim(),
                    //time:  $time.text().trim()
                };
                // 从URL中取出文章的ID
                var s = item.url.match(/-([a-zA-Z0-9]+)/);
                if (Array.isArray(s)) {
                    item.id = s[1];
                    articleList.push(item);
                }
            });

            //postKeyword = '.opi-right-info';
            //titleKeyword = '.entry-title-blue-opi a'
            //authorKeyword = '.details-opinion-s a'
            //
            //$(postKeyword).each(function () {
            //    var $me = $(this);
            //    var $title = $me.find(titleKeyword);
            //    var $thumb = $me.find(thumbKeyword);
            //    var $author = $me.find(authorKeyword);
            //    debug( $title.text() );
            //    debug( config.christianpost.murl + $title.attr('href') );
            //
            //    //var $time = $me.find('.atc_tm');
            //    var item = {
            //        title: $title.text().trim(),
            //        url:   config.christianpost.murl + $title.attr('href'),
            //        thumb: $thumb.attr('src'),
            //        author: $author.text().trim(),
            //        //time:  $time.text().trim()
            //    };
            //    // 从URL中取出文章的ID
            //    var s = item.url.match(/-([a-zA-Z0-9]+)/);
            //    if (Array.isArray(s)) {
            //        item.id = s[1];
            //        articleList.push(item);
            //    }
            //});

            postKeyword = '.opi-box-center-list-right';
            titleKeyword = '.entry-title-blue-opi a'
            thumbKeyword = '.opi-box-center-list-right img';
            authorKeyword = '.byline a'
        }


        $(postKeyword).each(function () {
            var $me = $(this);
            //debug($me);

            var $title = $me.find(titleKeyword);
            var $thumb = $me.find(thumbKeyword);
            var $author = $me.find(authorKeyword);

            //console.log("---------------------");
            //debug( $me );
            //console.log( thumbKeyword );
            //console.log( $thumb );
            //console.log("---------------------");

            if($thumb == '' && url != 'http://chinese.christianpost.com/') {
                thumbKeyword = '.entry-thumb img';
                $thumb = $me.find(thumbKeyword);
            }

            debug( $title.text() );
            debug( config.christianpost.murl + $title.attr('href') );
            debug( $thumb.attr('src') );
            debug( $author.text() );

            //var $time = $me.find('.atc_tm');
            var item = {
                title: $title.text().trim(),
                url:   config.christianpost.murl + $title.attr('href'),
                thumb: $thumb.attr('src'),
                author: $author.text().trim(),
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
        var nextUrl = config.christianpost.url + $('.pageNext a').attr('href');
        if ( $('.pageNext a').attr('href') ) {
            console.log(nextUrl);

            // 读取下一页
            exports.articleList(nextUrl, function (err, articleList2) {
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

exports.articleList('http://chinese.christianpost.com/archive/culture/', function (err, articleList) {
    if (err) console.error(err.stack);
    console.log(articleList);
});