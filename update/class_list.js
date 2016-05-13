var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update');

debug('读取博文类别列表');

// 读取博客首页
request('http://chinese.christianpost.com', function (err, res) {
    if (err) return console.error(err);

    // 根据网页内容创建DOM操作对象
    var $ = cheerio.load(res.body.toString());

    // 读取博文类别列表
    var classList = [];
    debug( $('.nav-mobile-wrapper li a') );

    $('.nav-mobile-wrapper li a').each(function () {
        var $me = $(this);
        debug($me);
        var item = {
            name: $me.text().trim(),
            url:  "http://chinese.christianpost.com" + $me.attr('href')
        };
        // 从URL中取出分类的ID
        var s = item.url.match(/articlelist_\d+_(\d+)_\d\.html/);
        if (Array.isArray(s)) {
            item.id = s[1];
            classList.push(item);
        }
        else
            classList.push(item);
    });

    // 输出结果
    console.log(classList);
});