truncate table article_detail;
truncate table article_list;
truncate table article_tag;
truncate table class_list;


--
-- 2016-05-29
--

CREATE TABLE IF NOT EXISTS `page_view` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(20) NOT NULL,
  `uuid` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

alter table `article_list`
Add column page_view int(6) DEFAULT 0 AFTER `time_text`;


CREATE TABLE IF NOT EXISTS `page_view` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(20) NOT NULL,
  `uuid` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 2016-05-26
--

CREATE TABLE IF NOT EXISTS `user_wechat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(50) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `sex` varchar(2),
  `province` varchar(50),
  `city` varchar(50),
  `country` varchar(50),
  `headimgurl` varchar(250),
  `privilege` varchar(100),
  `unionid` varchar(50),
  `create_time` DATETIME,
  PRIMARY KEY (`id`,`openid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `create_time` DATETIME,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- 服务器
--

CREATE TABLE IF NOT EXISTS `user_wechat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(50) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `sex` varchar(2),
  `province` varchar(50),
  `city` varchar(50),
  `country` varchar(50),
  `headimgurl` varchar(250),
  `privilege` varchar(100),
  `unionid` varchar(50),
  `create_time` DATETIME,
  PRIMARY KEY (`id`,`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `create_time` DATETIME,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



--
-- 2016-05-20
--

desc `class_list`;

alter table `class_list`
Add column category_name text FIRST;

select * from `class_list`;
update class_list set category_name = '基督邮报' where category_name is null;