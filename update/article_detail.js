var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update');

debug('读取博文内容');

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var url = 'http://m.chinese.christianpost.com/news/%E4%BD%BF%E5%90%AC%E9%81%93%E6%9B%B4%E6%9C%89%E6%9E%9C%E6%95%88%E7%9A%847%E4%B8%AA%E6%96%B9%E6%B3%95-21601/';
// 读取博文页面
request(url, function (err, res) {
    if (err) return callback(err);

    // 根据网页内容创建DOM操作对象
    var $ = cheerio.load(res.body.toString());

    var s = url.match(/-([a-zA-Z0-9]+)\//);
    debug(s);
    if (Array.isArray(s)) {
        id = s[1];
        debug(id);
    }

    // 获取文章标签
    var tags = [];
    $('.blog_tag h3 a').each(function () {
        var tag = $(this).text().trim();
        if (tag) {
            tags.push(tag);
        }
    });

    // 获取文章内容
    //var content = $('.entry-content').html().trim();
    //var content = res.body.toString();
    var content = $('article').html().trim();

    var time_text = $('.date').text();

    if(time_text == null || time_text == '')
        time_text = new Date().Format("yyyy-MM-dd hh:mm");


    time_text = new Date().Format("yyyy-MM-dd hh:mm");

    // 输出结果
    console.log({tags: tags, content: content, time_text: time_text});
});