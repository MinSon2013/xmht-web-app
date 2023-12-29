CREATE TABLE `district` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `province_id` varchar(255) NOT NULL,
  `updated_date` varchar(20) DEFAULT NULL,
  `updated_by_user_id` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `district`
  ADD PRIMARY KEY (`id`);
  
  
  
 CREATE TABLE `store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agency_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `province_id` int(3) NOT NULL,
  `store_name` VARCHAR(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `updated_date` varchar(20) DEFAULT NULL,
  `updated_by_user_id` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `store`
  ADD PRIMARY KEY (`id`);
  
  
  
 CREATE TABLE `report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agency_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `province_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `store_information` text,
  `report_content` text,
  `other_store_name` varchar(255) DEFAULT NULL,
  `note` varchar(255),
  `attach_file` varchar(255),
  `file_path` text,
  `mime_type` varchar(150) NOT NULL,
  `update_date` VARCHAR(20),
  `create_date` VARCHAR(20),
  `updated_by_user_id` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `report`
  ADD PRIMARY KEY (`id`);
  
  
  
 CREATE TABLE `user_district` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `updated_date` varchar(18)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `user_district`
  ADD PRIMARY KEY (`id`);
