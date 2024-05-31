CREATE DATABASE IF NOT EXISTS res_hub;

USE res_hub;

CREATE TABLE IF NOT EXISTS `log_download` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `link_download` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `by_user` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_ip` varchar(50) COLLATEh utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salt` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_roles_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`user_roles_id`),
  UNIQUE KEY `user_id` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `fk_user_id_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO res_hub.role (role_id, role_name) VALUES (1, 'admin');
INSERT INTO res_hub.role (role_id, role_name) VALUES (2, 'user');

INSERT INTO res_hub.user (user_id, username, password, fullname, salt, created_at, updated_at) VALUES (2, 'admin', '$2a$10$FopZCZu5CYvpTb14UEV27u56H31eGfxz27RgJVMi/5NExtfDLqEQi', 'Duyen', '$2a$10$FopZCZu5CYvpTb14UEV27u', '2021-09-03 23:51:49', '2021-09-03 23:51:49');
INSERT INTO res_hub.user (user_id, username, password, fullname, salt, created_at, updated_at) VALUES (28, 'hecker', '$2a$10$FWtihsxfQl4J16XdTHbte.WdWIrY1xZhz0FO4e/p3MhuBf4Uh2AHi', 'Hecker', '$2a$10$FWtihsxfQl4J16XdTHbte.', '2021-09-12 19:47:15', '2021-09-12 19:47:15');

INSERT INTO res_hub.user_roles (user_roles_id, user_id, role_id) VALUES (2, 2, 1);
INSERT INTO res_hub.user_roles (user_roles_id, user_id, role_id) VALUES (13, 28, 2);


CREATE USER 'dev'@'%' IDENTIFIED WITH mysql_native_password BY 'dev#$@!@!@!#!#@#@($';
GRANT ALL PRIVILEGES ON res_hub.* TO 'dev'@'%';
FLUSH PRIVILEGES ;

