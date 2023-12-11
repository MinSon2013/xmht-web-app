ALTER TABLE notification
ADD notification_type tinyint(1),
ADD updated_date varchar(18),
ADD order_id int(11);