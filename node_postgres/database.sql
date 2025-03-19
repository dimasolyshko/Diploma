-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица продуктов питания
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    calories INT NOT NULL,
    proteins FLOAT NOT NULL,
    fats FLOAT NOT NULL,
    carbohydrates FLOAT NOT NULL
);

-- Таблица для связи пользователей и съеденных продуктов
CREATE TABLE user_foods (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    portion_size FLOAT NOT NULL -- Размер порции в граммах
);

-- Таблица с информацией о витаминах и минералах
CREATE TABLE nutrients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL -- Единица измерения (мг, мкг и т.д.)
);

-- Таблица для связи продуктов с витаминами
CREATE TABLE food_nutrients (
    id SERIAL PRIMARY KEY,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE,
    nutrient_id INT REFERENCES nutrients(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL -- Количество данного нутриента в 100г продукта
);

-- Дополнение данных к пользователям
ALTER TABLE users 
ADD COLUMN weight FLOAT NOT NULL,
ADD COLUMN height FLOAT NOT NULL,
ADD COLUMN age INT NOT NULL,
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
ADD COLUMN activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) NOT NULL,
