const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Подключение к базе
require('dotenv').config(); // Для работы с переменными окружения

class UserController {
    // Регистрация пользователя
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            
            // Проверяем, есть ли уже такой пользователь
            const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await pool.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
                [username, email, hashedPassword]
            );

            res.status(201).json({ message: 'Регистрация успешна', user: newUser.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Авторизация пользователя
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Ищем пользователя в БД
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ message: 'Неверный email или пароль' });
            }

            // Проверяем пароль
            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!validPassword) {
                return res.status(400).json({ message: 'Неверный email или пароль' });
            }

            console.log("JWT_SECRET in login:", process.env.JWT_SECRET);

            // Генерируем JWT токен
            const token = jwt.sign(
                { userId: user.rows[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // Токен на 7 дней
            );

            res.json({ message: 'Авторизация успешна', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение информации о текущем пользователе
    async getUserInfo(req, res) {
        try {
            const userId = req.user.userId; // id из токена (middleware auth)
            const user = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [userId]);

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.json(user.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController();
