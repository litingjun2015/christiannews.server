var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update');

debug('读取博文内容');

// 读取博文页面
request('http://chinese.christianpost.com/news/%E9%98%BF%E6%8B%89%E5%B7%B4%E9%A9%AC%E5%B7%9E%E6%95%99%E4%BC%9A%E5%B0%86%E4%B8%BA%E4%BC%9A%E5%8F%8B%E7%AD%89%E6%94%AF%E4%BB%984-1%E4%B8%87%E7%BE%8E%E5%85%83%E7%9A%84%E5%80%BA%E5%8A%A1-21424/', function (err, res) {
    if (err) return callback(err);

    // 根据网页内容创建DOM操作对象
    var $ = cheerio.load(res.body.toString());

    // 获取文章标签
    var tags = [];
    $('.blog_tag h3 a').each(function () {
        var tag = $(this).text().trim();
        if (tag) {
            tags.push(tag);
        }
    });

    // 获取文章内容
    var content = $('.entry-content').html().trim();

    // 输出结果
    console.log({tags: tags, content: content});
});