CREATE TABLE `district` (
  `id` int(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `province_id` varchar(255) NOT NULL,
  `updated_date` varchar(18) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `district`
  ADD PRIMARY KEY (`id`);
  
  
 CREATE TABLE `store` (
  `id` int(11) NOT NULL,
  `agency_id` int(11) NOT NULL,
  `store_name` VARCHAR(255) NOT NULL,
  `district_id` int(11) NOT NULL,
  `province_id` int(3) NOT NULL,
  `updated_date` varchar(18) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `store`
  ADD PRIMARY KEY (`id`);