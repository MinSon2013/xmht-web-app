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
  `district_id` int(11) NOT NULL,
  `province_id` int(3) NOT NULL,
  `store_name` VARCHAR(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `note` varchar(255),
  `updated_date` varchar(18),
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `store`
  ADD PRIMARY KEY (`id`);
  
 CREATE TABLE `report` (
  `id` int(11) NOT NULL,
  `agency_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `province_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `other_store_name` varchar(200) DEFAULT NULL,
  `store_information` text,
  `report_content` text,
  `note` text,
  `attach_file` varchar(255),
  `file_path` text,
  `mime_type` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `update_date` VARCHAR(20),
  `create_date` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `report`
  ADD PRIMARY KEY (`id`);