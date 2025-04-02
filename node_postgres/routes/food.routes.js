const express = require('express');
const FoodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/add', authMiddleware, FoodController.addFood); 
router.get('/list', authMiddleware, FoodController.getFoods);
router.patch('/update', authMiddleware, FoodController.updateFood);
router.delete('/delete', authMiddleware, FoodController.deleteFood);

router.post('/log', authMiddleware, FoodController.logFood);

module.exports = router;