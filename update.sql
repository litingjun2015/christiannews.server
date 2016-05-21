truncate table article_detail;
truncate table article_list;
truncate table article_tag;
truncate table class_list;

--
-- 2016-05-20
--

alter table `class_list`
Add column category_name text FIRST;

update class_list set category_name = '基督邮报';