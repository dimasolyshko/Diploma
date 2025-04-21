const express = require('express');
const FoodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/add', authMiddleware, FoodController.addFood); 
router.get('/list', authMiddleware, FoodController.getFoods);
router.patch('/update', authMiddleware, FoodController.updateFood);
router.delete('/delete', authMiddleware, FoodController.deleteFood);

router.get('/nutrients', authMiddleware, FoodController.getNutrients);

router.post('/log', authMiddleware, FoodController.logFood);
router.delete('/log', authMiddleware, FoodController.deleteFoodLog);
router.patch('/log', authMiddleware, FoodController.updateFoodLog);

router.get('/daily', authMiddleware, FoodController.getDailyFood);
router.get('/stats', authMiddleware, FoodController.getDailyStats);

module.exports = router;