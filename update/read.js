var originRequest = require('request');
var config = require('../config');
var cheerio = require('cheerio');
var debug = require('debug')('blog:update:read');

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

/**
 * 请求指定URL
 *
 * @param {String} url
 * @param {Function} callback
 */
function request (url, callback) {
  originRequest(url, callback);
}


/**
 * 获取文章分类列表
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.classList = function (url, callback) {
  debug('读取文章分类列表：%s', url);

  request(url, function (err, res) {
    if (err) return callback(err);

    // 根据网页内容创建DOM操作对象
    var $ = cheerio.load(res.body.toString());

    // 读取博文类别列表
    var classList = [];
    $('.nav-mobile-wrapper li a').each(function () {
      var $me = $(this);
      debug($me);

      var item = {
        name: $me.text().trim(),
        url:  url + $me.attr('href')
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

    // 返回结果
    callback(null, classList);
  });
};

/**
 * 获取分类页面博文列表
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.articleList = function (url, callback) {
  debug('读取博文列表：%s', url);

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
    var thumbKeyword = '.entry-thumb-right img';
    var authorKeyword = '.entry-byline a'

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
        debug( config.christianpost.url + $title.attr('href') );


        //console.log("---------------------");
        //debug( $me );
        //console.log( thumbKeyword );
        //console.log( $thumb );
        //console.log("---------------------");

        //var $time = $me.find('.atc_tm');
        var item = {
          title: $title.text().trim(),
          url:   config.christianpost.url + $title.attr('href'),
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
      //    debug( config.christianpost.url + $title.attr('href') );
      //
      //    //var $time = $me.find('.atc_tm');
      //    var item = {
      //        title: $title.text().trim(),
      //        url:   config.christianpost.url + $title.attr('href'),
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
      debug( config.christianpost.url + $title.attr('href') );
      debug( $thumb.attr('src') );
      debug( $author.text() );

      //var $time = $me.find('.atc_tm');
      var item = {
        title: $title.text().trim(),
        url:   config.christianpost.url + $title.attr('href'),
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
};

/**
 * 获取博文页面内容
 *
 * @param {String} url
 * @param {Function} callback
 */
exports.articleDetail = function (url, callback) {
  debug('读取博文内容：%s', url);

  request(encodeURI(url), function (err, res) {
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
    if($('.entry-content').html() != null)
      var content = $('.entry-content').html().trim();

    var time_text = new Date().Format("yyyy-MM-dd hh:mm");

    if($('.date') != null)
       time_text = $('.date').text();

    // 返回结果
    callback(null, {tags: tags, content: content, time_text: time_text});
  });
};