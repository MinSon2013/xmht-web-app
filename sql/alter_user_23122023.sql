ALTER TABLE users
ADD `role` int(2) DEFAULT 0;

 CREATE TABLE `user_district` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `updated_date` varchar(18)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `user_district`
  ADD PRIMARY KEY (`id`);