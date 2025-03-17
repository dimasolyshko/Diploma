const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Нет доступа, требуется авторизация' });
    }

    const token = authHeader.split(' ')[1]; // Получаем сам токен
    console.log("Token received:", token); // Логируем токен для проверки

    try {
        console.log("JWT_SECRET in middleware:", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ message: 'Неверный или просроченный токен' });
    }
};
