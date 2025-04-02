const express = require('express');
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', UserController.register);  
router.post('/login', UserController.login);        

router.get('/me', authMiddleware, UserController.getUserInfo); 

router.patch('/update', authMiddleware, UserController.updateProfile); 
router.patch('/update-password', authMiddleware, UserController.updatePassword);

module.exports = router;
