var originRequest = require('request');
var async = require('async');
var db = require('../config').db;
var debug = require('debug')('blog:update:save');
var debug2 = require('debug')('blog:debug2');
var cheerio = require('cheerio');


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
 * 保存文章分类
 *
 * @param {Object} list
 * @param {Function} callback
 */
exports.classList = function (list, callback) {
  debug('保存文章分类列表到数据库中: %d', list.length);

  var newclassList = [];

  async.eachSeries(list, function (item, next) {

    // 查询分类是否已存在
    db.query('SELECT * FROM `class_list` WHERE `name`=? LIMIT 1', [item.name], function (err, data) {
      if (err)
      {
        debug(err);
        return next(err);
      }

      if (Array.isArray(data) && data.length >= 1) {
        // 分类已存在，更新一下
        //console.log("---------------------- data");
        //console.log(data);
        //console.log(data[0].id);
        db.query('UPDATE `class_list` SET `name`=?, `url`=? WHERE `id`=?', [item.name, item.url, item.id], next);
        item.id = data[0].id;
        newclassList.push(item);
        //console.log("---------------------- newclassList");
        //console.log(newclassList);
      } else {
        // 分类不存在，添加
        db.query('INSERT INTO `class_list`(`id`, `name`, `url`) VALUES (?, ?, ?)', [item.id, item.name, item.url], next);
        newclassList.push(item);
      }
    });

    list = newclassList;
    //console.log(list);

    return list;

  }, callback);


};

exports.getclassList = function (url, callback) {
  debug('从数据库读取文章分类列表：%s', url);

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
 * 保存文章列表
 *
 * @param {Number} class_id
 * @param {Array} list
 * @param {Function} callback
 */
exports.articleList = function (class_id, list, callback) {
  debug('保存文章列表到数据库中: %d, %d', class_id, list.length);

  async.eachSeries(list, function (item, next) {

    // 查询文章是否已存在
    db.query('SELECT * FROM `article_list` WHERE `id`=? AND `class_id`=? LIMIT 1',
      [item.id, class_id], function (err, data) {
      if (err) return next(err);

      // 将发布时间转成时间戳（秒）
      //var created_time = new Date(item.time).getTime() / 1000;
      var created_time = new Date().getTime() / 1000;

      if (Array.isArray(data) && data.length >= 1) {
        // 分类已存在，更新一下
        db.query('UPDATE `article_list` SET `title`=?, `author`=?, `url`=?, `thumb`=?, `class_id`=?, `created_time`=? WHERE `id`=? AND `class_id`=?',
          [item.title, item.author,　item.url, item.thumb, class_id, created_time, item.id, class_id], next);
      } else {
        // 分类不存在，添加
        db.query('INSERT INTO `article_list`(`id`, `title`, `author`, `url`, `thumb`, `class_id`, `created_time`) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.id, item.title, item.author, item.url, item.thumb, class_id, created_time], next);
      }
    });

  }, callback);
};

/**
 * 保存文章分类的文章数量
 *
 * @param {Number} class_id
 * @param {Number} count
 * @param {Function} callback
 */
exports.articleCount = function (class_id, count, callback) {
  debug('保存文章分类的文章数量：%d, %d', class_id, count);

  db.query('UPDATE `class_list` SET `count`=? WHERE `id`=?', [count, class_id], callback);
};

/**
 * 保存文章标签
 *
 * @param {String} id
 * @param {Array} tags
 * @param {Function} callback
 */
exports.articleTags = function (id, tags, callback) {
  debug('保存文章标签: %s, %s', id, tags);

  // 删除旧的标签信息
  db.query('DELETE FROM `article_tag` WHERE `id`=?', [id], function (err) {
    if (err) return callback(err);

    if (tags.length > 0) {
      // 添加新标签信息
      // 生成SQL代码
      var values = tags.map(function (tag) {
        return '(' + db.escape(id) + ', ' + db.escape(tag) + ')';
      }).join(', ');

      db.query('INSERT INTO `article_tag`(`id`, `tag`) VALUES ' + values, callback);
    } else {
      // 如果没有标签，直接返回
      callback(null);
    }
  });
};

/**
 * 保存文章内容
 *
 * @param {String} id
 * @param {Array} tags
 * @param {String} content
 * @param {Function} callback
 */
exports.articleDetail = function (id, tags, content, time_text, callback) {
  debug('保存文章内容: %s', id);
  debug2('保存文章内容: %s', id);

  // 检查文章是否存在
  db.query('SELECT `id` FROM `article_detail` WHERE `id`=?', [id], function (err, data) {
    if (err) return callback(err);

    tags = tags.join(' ');
    if (Array.isArray(data) && data.length >= 1) {
      // 更新文章
      db.query('UPDATE `article_detail` SET `tags`=?, `content`=? WHERE `id`=?', [tags, content, id], callback);
    } else {
      // 添加文章
      db.query('INSERT INTO `article_detail`(`id`, `tags`, `content`) VALUES (?, ?, ?)', [id, tags, content], callback);
    }
  });


  db.query('SELECT `id` FROM `article_list` WHERE `id`=?', [id], function (err, data) {
    if (err) return callback(err);

    if (Array.isArray(data) && data.length >= 1) {
      // 更新文章
      db.query('UPDATE `article_list` SET `time_text`=? WHERE `id`=?', [time_text, id], callback);
    }

  });
};

/**
 * 检查文章是否存在
 *
 * @param {String} id
 * @param {Function} callback
 */
exports.isAericleExists = function (id, callback) {
  db.query('SELECT `id` FROM `article_detail` WHERE `id`=?', [id], function (err, data) {
    if (err) return callback(err);

    callback(null, Array.isArray(data) && data.length >= 1);
  });
};