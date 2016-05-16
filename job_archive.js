var path = require('path');
var express = require('express');
var spawn = require('child_process').spawn;
var cronJob = require('cron').CronJob;
var read = require('./web/read');
var config = require('./config');
var db = require('./config').db;


// 定时执行更新任务
var job = new cronJob(config.archiveUpdate, function () {
  console.log('开始执行定时更新任务');
  var update = spawn(process.execPath, [path.resolve(__dirname, 'update/archive.js')]);
  update.stdout.pipe(process.stdout);
  update.stderr.pipe(process.stderr);
  update.on('close', function (code) {
    console.log('更新任务结束，代码=%d', code);
  });
});
job.start();


process.on('uncaughtException', function (err) {
  console.error('uncaughtException: %s', err.stack);
})