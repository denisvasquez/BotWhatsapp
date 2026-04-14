-- BotWhatsapp
-- Table for storing number information

DROP TABLE IF EXISTS Numbers;

CREATE TABLE Numbers (
    number_id VARCHAR(50) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message TIMESTAMP DEFAULT NULL,
    active_session BINARY DEFAULT 1,
    saving_date BINARY DEFAULT 0,
    asking_product BINARY DEFAULT 0
);