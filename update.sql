
--
-- 2016-05-20
--

alter table `class_list`
Add column category_name text FIRST;

update class_list set category_name = '基督邮报';