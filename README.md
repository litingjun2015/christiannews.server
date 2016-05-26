# christiannews.server

参考：
https://github.com/leizongmin/book-crawler-mysql-cron/blob/master/book.md


### 使用 pm2 来启动程序

有时候，由于 Node.js 自身的 Bug 或者使用到的第三方 C++ 模块的缺陷而导致一些底层
的错误，比如在 Linux 系统下偶尔会发生段错误（segment fault）导致进程崩溃，此时
上面提到的处理 uncaughtException 事件的方法就不适用了。

pm2 是一个功能强大的进程管理器，通过 `pm2 start` 来启动 Node.js 程序，当该进程异
常退出时，pm2 会自动尝试重启进程，这样可以保证 Node.js 应用稳定运行。同时 pm2 还
可以很方便地查看其所启动的各个进程的内存占用和日志等信息。


#### 安装 pm2

在命令行下执行 `npm install -g pm2` 安装 pm2 命令行工具。


#### 启动和停止程序

假如要启动的程序文件路径是 `~/app.js` ，在命令行下执行 `pm2 start ~/app.js` 即可
启动程序，执行 `pm2 stop ~/app.js` 即可停止该程序。

关于 pm2 命令行工具的详细使用方法，可访问该工具的主页来获取：
https://npmjs.org/package/pm2


### 5.26 https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters

npm install body-parser --save