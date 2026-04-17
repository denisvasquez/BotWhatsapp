-- BotWhatsapp
-- Table for storing number information
CREATE DATABASE IF NOT EXISTS BotWhatsapp;
USE BotWhatsapp;

DROP TABLE IF EXISTS Numbers;

CREATE TABLE Numbers (
    number_id VARCHAR(50) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_message TINYINT(1) DEFAULT 0,
    active_session TINYINT(1) DEFAULT 1,
    asking_product TINYINT(1) DEFAULT 0
);

DROP TABLE IF EXISTS Products;

CREATE TABLE Products (
    product_id INT (11) PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(150) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_stock INT(11) NOT NULL
);

INSERT INTO Products (product_name, product_price, product_stock) VALUES
('Shampoo', 10.99, 100),
('Acondicionador', 19.99, 50),
('Jabón', 5.99, 200);
