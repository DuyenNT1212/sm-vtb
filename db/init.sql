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

CREATE TABLE VTB.SM_SERVER_FILE
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    system_id   INT,
    file_name        VARCHAR(255),
    content    VARCHAR(255),
    created_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE USER 'dev'@'%' IDENTIFIED WITH mysql_native_password BY 'dev#$@!@!@!#!#@#@($';
GRANT ALL PRIVILEGES ON res_hub.* TO 'dev'@'%';
FLUSH PRIVILEGES ;

