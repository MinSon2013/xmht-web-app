------ ALTER TABLE `menu` --------------
---   ALTER TABLE menu
---   ADD `position` int(2) DEFAULT 0,
---   ADD `role` int(2) DEFAULT 0;
---   
---   INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
---   (10, 0, 'store', 'Danh sách cửa hàng', 'fa-shop', 0, 5);
---   INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
---   (11, 0, 'district', 'Quản lý khu vực', 'fa-building', 1, 6);
---   INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
---   (12, 0, 'user', 'Quản lý User', 'fa-user', 1, 7);
---   INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
---   (13, 0, 'report', 'Báo cáo', 'fa-file-lines', 1, 8);
---   
---   UPDATE menu
---   SET `position` = 1
---   WHERE `route_link` = 'dashboard';
---   UPDATE menu
---   SET `position` = 2
---   WHERE `route_link` = 'orders';
---   UPDATE menu
---   SET `position` = 3
---   WHERE `route_link` = 'products';
---   UPDATE menu
---   SET `position` = 4
---   WHERE `route_link` = 'agency';
---   UPDATE menu
---   SET `position` = 18
---   WHERE `route_link` = 'statistics';
---   UPDATE menu
---   SET `position` = 19
---   WHERE `route_link` = 'notification';
---   UPDATE menu
---   SET `position` = 20
---   WHERE `route_link` = 'logout';
---   


------ ALTER TABLE `agency` ------------------

ALTER TABLE `agency`
ADD `updated_date` varchar(20) DEFAULT NULL,
ADD `updated_by_user_id` int(11) DEFAULT 0,
CHANGE  `full_name` `agency_name` varchar(200);

-- ALTER TABLE `agency` CHANGE  `full_name` `agency_name` varchar(200);



------ ALTER TABLE `notification` ------------------

ALTER TABLE notification
--   ADD notification_type tinyint(1),
--   ADD updated_date varchar(18),
--   ADD order_id int(11),
--   ADD status_order varchar(100),
ADD report_id int(11) DEFAULT 0,
DROP `short_contents`;


------ ALTER TABLE `orders` ------------------

ALTER TABLE `orders`
ADD `updated_date` varchar(20) DEFAULT NULL;



------ ALTER TABLE `products` ------------------

ALTER TABLE `products`
ADD `updated_by_user_id` int(11) DEFAULT 0;



------ ALTER TABLE `report` ------------------

--     ALTER TABLE `report` ADD `other_store_name` varchar(200) DEFAULT NULL;

--    ALTER TABLE `report` ADD `updated_by_user_id` int(11) DEFAULT 0;



------ ALTER TABLE `district` ------------------

--    ALTER TABLE `district` CHANGE  `user_id` `updated_by_user_id` int(11) DEFAULT 0;




------ ALTER TABLE `users` ------------------

ALTER TABLE `users`
ADD `role` int(2) DEFAULT 0,
ADD `full_name` varchar(255) DEFAULT NULL,
ADD `updated_date` varchar(20) DEFAULT NULL,
ADD `updated_by_user_id` int(11) DEFAULT 0;

UPDATE `users`
SET `role` = 1
WHERE `username` = 'thukho';

ALTER TABLE `users`
DROP is_stocker;



------ ALTER TABLE `store` ------------------

---    ALTER TABLE `store` CHANGE  `user_id` `updated_by_user_id` int(11) DEFAULT 0;
