UPDATE `users`
SET `role` = 1
WHERE `username` = 'thukho';

ALTER TABLE `users`
ADD `full_name` varchar(200) DEFAULT NULL,
ADD `updated_date` varchar(20) DEFAULT NULL,
ADD `updated_by_user_id` int(11) DEFAULT 0;

ALTER TABLE `users`
DROP is_stocker;



ALTER TABLE `report`
ADD `other_store_name` varchar(200) DEFAULT NULL;



ALTER TABLE `agency`
ADD `updated_date` varchar(20) DEFAULT NULL,
ADD `updated_by_user_id` int(11) DEFAULT 0;

ALTER TABLE `agency` CHANGE  `full_name` `agency_name` varchar(200);



ALTER TABLE `district` CHANGE  `user_id` `updated_by_user_id` int(11) DEFAULT 0;



ALTER TABLE `notification`
DROP `short_contents`;



ALTER TABLE `orders`
ADD `updated_date` varchar(20) DEFAULT NULL;



ALTER TABLE `products`
ADD `updated_by_user_id` int(11) DEFAULT 0;



ALTER TABLE `report`
ADD `updated_by_user_id` int(11) DEFAULT 0;



ALTER TABLE `store` CHANGE  `user_id` `updated_by_user_id` int(11) DEFAULT 0;
