// MySQL数据库连接配置
var mysql = require('mysql');
exports.db = mysql.createConnection({
  host:            '127.0.0.1',   // 数据库地址
  port:            3306,          // 数据库端口
  database:        'christianpost',   // 数据库名称
  user:            'root',        // 数据库用户
  password:        '619126'             // 数据库用户对应的密码
});

//exports.db = mysql.createConnection({
//  host:            '559f471ab5cd7.gz.cdb.myqcloud.com',   // 数据库地址
//  port:            18281,          // 数据库端口
//  database:        'christianpost',   // 数据库名称
//  user:            'cdb_outerroot',        // 数据库用户
//  password:        'DuangWiFi2015'             // 数据库用户对应的密码
//});

// 博客配置
exports.sinaBlog = {
  url: 'http://blog.sina.com.cn/u/1776757314'  // 博客首页地址
};

exports.christianpost = {
  url: 'http://chinese.christianpost.com'
};

// Web服务器端口
exports.port = 3000;

// 定时更新
exports.autoUpdate = '* */30 * * *';  // 任务执行规则，参考 cron 语法
//exports.autoUpdate = '* * * * *';  // 任务执行规则，参考 cron 语法