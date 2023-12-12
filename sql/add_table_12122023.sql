CREATE TABLE `district` (
  `id` int(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `provice` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `district`
  ADD PRIMARY KEY (`id`);