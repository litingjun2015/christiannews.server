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

var url = 'http://chinese.christianpost.com/news/%E5%8D%8E%E7%90%86%E5%85%8B-%E5%9F%BA%E7%9D%A3%E5%BE%92%E5%BF%85%E9%A1%BB%E6%8E%A5%E5%8F%97%E8%80%B6%E7%A8%A3-%E8%80%8C%E4%B8%8D%E5%8F%AA%E6%98%AF-%E5%B8%8C%E6%9C%9B-%E5%8E%BB%E5%A4%A9%E5%A0%82-21442/';
// 读取博文页面
request(url, function (err, res) {
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

    var time_text = $('.date').text();

    if(time_text == null || time_text == '')
        time_text = new Date().Format("yyyy-MM-dd hh:mm");



    // 输出结果
    console.log({tags: tags, content: content, time_text: time_text});
});