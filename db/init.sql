CREATE DATABASE IF NOT EXISTS sm_vtb;

USE sm_vtb;

CREATE TABLE vtb.SM_SYSTEM
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255),
    username    VARCHAR(255),
    created_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE VTB.SM_IP_HOSTNAME
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    system_id   INT ,
    IP        VARCHAR(255),
    hostname    VARCHAR(255),
    created_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE SM_SERVER_FILE
    ADD FOREIGN KEY (system_id) REFERENCES SM_SYSTEM(id);
alter table SM_IP_HOSTNAME add note VARCHAR(255);

CREATE TABLE IF NOT EXISTS `SM_USER` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `fullname` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `salt` text COLLATE utf8mb4_unicode_ci,
    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
    ) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VTB.SM_SERVER_FILE
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    system_id   INT,
    file_name        VARCHAR(255),
    content    VARCHAR(255),
    created_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO SM_USER (username, password, fullname, salt) VALUES ('admin', '$2a$10$FopZCZu5CYvpTb14UEV27u56H31eGfxz27RgJVMi/5NExtfDLqEQi', 'Duyen', '$2a$10$FopZCZu5CYvpTb14UEV27u');

CREATE USER 'dev'@'%' IDENTIFIED WITH mysql_native_password BY 'dev#$@!@!@!#!#@#@($';
GRANT ALL PRIVILEGES ON res_hub.* TO 'dev'@'%';
FLUSH PRIVILEGES ;

