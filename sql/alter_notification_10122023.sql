ALTER TABLE notification
ADD notification_type tinyint(1),
ADD updated_date varchar(18),
ADD order_id int(11);

---------

ALTER TABLE notification
ADD status_order varchar(100);

--------------------
ALTER TABLE notification
ADD report_id int(11) DEFAULT 0;