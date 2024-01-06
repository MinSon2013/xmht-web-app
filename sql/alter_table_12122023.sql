
-- ALTER TABLE `agency` 

ALTER TABLE `agency`
ADD `updated_date` varchar(20) DEFAULT NULL,
ADD `updated_by_user_id` int(11) DEFAULT 0,
CHANGE  `full_name` `agency_name` varchar(200);

-- ALTER TABLE `notification` 

ALTER TABLE notification
ADD order_id int(11) DEFAULT 0,
ADD report_id int(11) DEFAULT 0,
DROP `short_contents`;


-- ALTER TABLE `orders` 

ALTER TABLE `orders`
ADD `updated_date` varchar(20) DEFAULT NULL;



-- ALTER TABLE `products` 

ALTER TABLE `products`
ADD `updated_by_user_id` int(11) DEFAULT 0;

-- ALTER TABLE `users` 

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
