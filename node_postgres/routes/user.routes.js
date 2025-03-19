const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', UserController.register);  // Регистрация
router.post('/login', UserController.login);        // Авторизация

router.get('/me', authMiddleware, UserController.getUserInfo); // Получение информации о пользователе (требуется токен)

router.patch('/update', authMiddleware, UserController.updateProfile); // Обновление профиля
router.patch('/update-password', authMiddleware, UserController.updatePassword); // Обновление пароля

module.exports = router;
