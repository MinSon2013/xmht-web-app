ALTER TABLE menu
ADD `position` int(2) DEFAULT 0;

INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
(10, 0, 'store', 'Danh sách cửa hàng', 'fa-shop', 0, 5);
INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
(11, 0, 'district', 'Quản lý khu vực', 'fa-building', 1, 6);

INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
(12, 0, 'user', 'Quản lý User', 'fa-user', 1, 7);

INSERT INTO `menu` (`id`, `parent_id`, `route_link`, `label`, `icon`, `is_admin`, `position`) VALUES
(13, 0, 'report', 'Báo cáo', 'fa-file-lines', 1, 8);


UPDATE menu
SET `position` = 1
WHERE `route_link` = 'dashboard';
UPDATE menu
SET `position` = 2
WHERE `route_link` = 'orders';
UPDATE menu
SET `position` = 3
WHERE `route_link` = 'products';
UPDATE menu
SET `position` = 4
WHERE `route_link` = 'agency';
UPDATE menu
SET `position` = 18
WHERE `route_link` = 'statistics';
UPDATE menu
SET `position` = 19
WHERE `route_link` = 'notification';
UPDATE menu
SET `position` = 20
WHERE `route_link` = 'logout';