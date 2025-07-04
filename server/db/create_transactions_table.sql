-- SQL to create the transactions table for your backend
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    category TEXT,
    sold BOOLEAN,
    date_of_sale TIMESTAMP,
    image TEXT
);
