const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

class UserController {
    // Регистрация пользователя
    async register(req, res) {
        try {
            const { username, email, password, weight, height, age, gender, activity_level } = req.body;

            const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await pool.query(
                `INSERT INTO users (username, email, password_hash, weight, height, age, gender, activity_level) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [username, email, hashedPassword, weight, height, age, gender, activity_level]
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

            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ message: 'Неверный email или пароль' });
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!validPassword) {
                return res.status(400).json({ message: 'Неверный email или пароль' });
            }

            const token = jwt.sign(
                { userId: user.rows[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
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
            const userId = req.user.userId;
            const user = await pool.query(
                'SELECT id, username, email, weight, height, age, gender, activity_level, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const userData = user.rows[0];

            // Рассчитываем BMR (основной обмен веществ)
            let BMR = userData.gender === 'male'
                ? 88.36 + (13.4 * userData.weight) + (4.8 * userData.height) - (5.7 * userData.age)
                : 447.6 + (9.2 * userData.weight) + (3.1 * userData.height) - (4.3 * userData.age);

            const activityMultiplier = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9
            };
            userData.daily_calories_goal = BMR * (activityMultiplier[userData.activity_level] || 1.2);

            res.json(userData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    //обновление информации о пользователе
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { username, weight, height, activity_level } = req.body;

            if (!username && !weight && !height && !activity_level) {
                return res.status(400).json({ message: 'Нет данных для обновления' });
            }

            let query = 'UPDATE users SET ';
            let fields = [];
            let values = [];
            
            if (username) {
                fields.push('username = $' + (fields.length + 1));
                values.push(username);
            }
            if (weight) {
                fields.push('weight = $' + (fields.length + 1));
                values.push(weight);
            }
            if (height) {
                fields.push('height = $' + (fields.length + 1));
                values.push(height);
            }
            if (activity_level) {
                fields.push('activity_level = $' + (fields.length + 1));
                values.push(activity_level);
            }

            query += fields.join(', ') + ' WHERE id = $' + (fields.length + 1) + ' RETURNING *';
            values.push(userId);

            const updatedUser = await pool.query(query, values);

            res.json({ message: 'Профиль обновлён', user: updatedUser.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление пароля пользователя
    async updatePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'Введите старый и новый пароль' });
            }

            // Получаем текущий пароль пользователя
            const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            // Проверяем старый пароль
            const isMatch = await bcrypt.compare(oldPassword, user.rows[0].password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Старый пароль неверен' });
            }

            // Хешируем новый пароль
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

            res.json({ message: 'Пароль успешно изменён' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController();    
