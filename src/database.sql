-- BotWhatsapp
-- Table for storing number information

DROP TABLE IF EXISTS Numbers;

CREATE TABLE Numbers (
    number_id VARCHAR(50) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message TIMESTAMP DEFAULT NULL,
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