const pool = require('../db');

class FoodController {
    // Добавление продукта с нутриентами
    async addFood(req, res) {
        try {
            const userId = req.user ? req.user.userId : null;
            const { name, calories, proteins, fats, carbohydrates, nutrients } = req.body;

            if (!name || !calories || !proteins || !fats || !carbohydrates) {
                return res.status(400).json({ message: 'Все поля обязательны' });
            }

            // Проверка на дубликаты
            let existingFood;
            if (userId) {
                existingFood = await pool.query(
                    `SELECT * FROM foods 
                     WHERE name = $1 AND user_id = $2 AND is_deleted = FALSE`,
                    [name, userId]
                );
            } else {
                existingFood = await pool.query(
                    `SELECT * FROM foods 
                     WHERE name = $1 AND user_id IS NULL AND is_deleted = FALSE`,
                    [name]
                );
            }

            if (existingFood.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Продукт с таким названием уже существует' 
                });
            }

            // Начинаем транзакцию
            await pool.query('BEGIN');

            // Добавление продукта
            const newFood = await pool.query(
                `INSERT INTO foods (name, calories, proteins, fats, carbohydrates, user_id, is_deleted) 
                 VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING *`,
                [name, calories, proteins, fats, carbohydrates, userId]
            );
            const foodId = newFood.rows[0].id;

            // Добавление нутриентов, если они указаны
            if (nutrients && Array.isArray(nutrients)) {
                for (const { nutrient_id, amount } of nutrients) {
                    if (!nutrient_id || !amount) {
                        await pool.query('ROLLBACK');
                        return res.status(400).json({ 
                            message: 'Для каждого нутриента нужны nutrient_id и amount' 
                        });
                    }

                    const nutrientExists = await pool.query(
                        `SELECT * FROM nutrients WHERE id = $1`,
                        [nutrient_id]
                    );
                    if (nutrientExists.rows.length === 0) {
                        await pool.query('ROLLBACK');
                        return res.status(400).json({ 
                            message: `Нутриент с ID ${nutrient_id} не найден` 
                        });
                    }

                    await pool.query(
                        `INSERT INTO food_nutrients (food_id, nutrient_id, amount) 
                         VALUES ($1, $2, $3)`,
                        [foodId, nutrient_id, amount]
                    );
                }
            }

            await pool.query('COMMIT');
            res.status(201).json({ message: 'Продукт добавлен', food: newFood.rows[0] });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка продуктов с нутриентами
    async getFoods(req, res) {
        try {
            const userId = req.user ? req.user.userId : null;
            const foods = await pool.query(
                `SELECT f.*, 
                        json_agg(
                            json_build_object(
                                'nutrient_id', fn.nutrient_id, 
                                'amount', fn.amount, 
                                'name', n.name, 
                                'unit', n.unit
                            )
                        ) FILTER (WHERE fn.nutrient_id IS NOT NULL) AS nutrients
                 FROM foods f
                 LEFT JOIN food_nutrients fn ON f.id = fn.food_id
                 LEFT JOIN nutrients n ON fn.nutrient_id = n.id
                 WHERE (f.user_id IS NULL OR f.user_id = $1) AND f.is_deleted = FALSE
                 GROUP BY f.id`,
                [userId]
            );
            res.json(foods.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Редактирование продукта с нутриентами
    async updateFood(req, res) {
        try {
            const userId = req.user.userId;
            const { foodId, name, calories, proteins, fats, carbohydrates, nutrients } = req.body;

            const food = await pool.query(
                `SELECT * FROM foods WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
                [foodId, userId]
            );
            if (food.rows.length === 0) {
                return res.status(403).json({ 
                    message: 'Нет доступа к этому продукту или он удалён' 
                });
            }

            // Проверка на дубликаты при изменении имени
            if (name && name !== food.rows[0].name) {
                const existingFood = await pool.query(
                    `SELECT * FROM foods 
                     WHERE name = $1 AND user_id = $2 AND is_deleted = FALSE AND id != $3`,
                    [name, userId, foodId]
                );
                if (existingFood.rows.length > 0) {
                    return res.status(400).json({ 
                        message: 'Продукт с таким названием уже существует' 
                    });
                }
            }

            // Начинаем транзакцию
            await pool.query('BEGIN');

            // Обновление основных данных продукта
            await pool.query(
                `UPDATE foods 
                 SET name = $1, calories = $2, proteins = $3, fats = $4, carbohydrates = $5 
                 WHERE id = $6`,
                [name, calories, proteins, fats, carbohydrates, foodId]
            );

            // Обновление нутриентов, если они переданы
            if (nutrients && Array.isArray(nutrients)) {
                // Удаляем старые нутриенты
                await pool.query(
                    `DELETE FROM food_nutrients WHERE food_id = $1`,
                    [foodId]
                );

                // Добавляем новые нутриенты
                for (const { nutrient_id, amount } of nutrients) {
                    if (!nutrient_id || !amount) {
                        await pool.query('ROLLBACK');
                        return res.status(400).json({ 
                            message: 'Для каждого нутриента нужны nutrient_id и amount' 
                        });
                    }

                    const nutrientExists = await pool.query(
                        `SELECT * FROM nutrients WHERE id = $1`,
                        [nutrient_id]
                    );
                    if (nutrientExists.rows.length === 0) {
                        await pool.query('ROLLBACK');
                        return res.status(400).json({ 
                            message: `Нутриент с ID ${nutrient_id} не найден` 
                        });
                    }

                    await pool.query(
                        `INSERT INTO food_nutrients (food_id, nutrient_id, amount) 
                         VALUES ($1, $2, $3)`,
                        [foodId, nutrient_id, amount]
                    );
                }
            }

            await pool.query('COMMIT');
            res.json({ message: 'Продукт обновлён' });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление продукта (мягкое удаление)
    async deleteFood(req, res) {
        try {
            const userId = req.user.userId;
            const { foodId } = req.body;

            const food = await pool.query(
                `SELECT * FROM foods WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
                [foodId, userId]
            );
            if (food.rows.length === 0) {
                return res.status(403).json({ 
                    message: 'Нет доступа к этому продукту или он уже удалён' 
                });
            }

            await pool.query(
                `UPDATE foods SET is_deleted = TRUE WHERE id = $1`,
                [foodId]
            );
            res.json({ message: 'Продукт помечен как удалённый' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Логирование еды в рацион
    async logFood(req, res) {
        try {
            const userId = req.user.userId;
            const { foodId, portionSize, mealType } = req.body;

            if (!foodId || !portionSize || !mealType) {
                return res.status(400).json({ 
                    message: 'Все поля (foodId, portionSize, mealType) обязательны' 
                });
            }

            const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
            if (!validMealTypes.includes(mealType)) {
                return res.status(400).json({ 
                    message: 'Недопустимый тип приёма пищи. Допустимые значения: breakfast, lunch, dinner, snack' 
                });
            }

            const food = await pool.query(
                `SELECT * FROM foods WHERE id = $1 AND is_deleted = FALSE`,
                [foodId]
            );
            if (food.rows.length === 0) {
                return res.status(404).json({ message: 'Продукт не найден или удалён' });
            }

            const log = await pool.query(
                `INSERT INTO user_foods (user_id, food_id, portion_size, meal_type) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [userId, foodId, portionSize, mealType]
            );

            res.status(201).json({ message: 'Еда добавлена в рацион', log: log.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление еды из рациона
    async deleteFoodLog(req, res) {
        try {
            const userId = req.user.userId;
            const { logId } = req.body;
    
            const log = await pool.query(
                `SELECT * FROM user_foods WHERE id = $1 AND user_id = $2`,
                [logId, userId]
            );
            if (log.rows.length === 0) {
                return res.status(404).json({ message: 'Запись не найдена или нет доступа' });
            }
    
            await pool.query(`DELETE FROM user_foods WHERE id = $1`, [logId]);
            res.json({ message: 'Запись удалена из рациона' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    //Редактирование порции продукта в рационе
    async updateFoodLog(req, res) {
        try {
            const userId = req.user.userId;
            const { logId, portionSize, mealType } = req.body;
    
            const log = await pool.query(
                `SELECT * FROM user_foods WHERE id = $1 AND user_id = $2`,
                [logId, userId]
            );
            if (log.rows.length === 0) {
                return res.status(404).json({ message: 'Запись не найдена или нет доступа' });
            }
    
            const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
            if (mealType && !validMealTypes.includes(mealType)) {
                return res.status(400).json({ message: 'Недопустимый тип приёма пищи' });
            }
    
            await pool.query(
                `UPDATE user_foods SET portion_size = $1, meal_type = $2 WHERE id = $3`,
                [portionSize || log.rows[0].portion_size, mealType || log.rows[0].meal_type, logId]
            );
            res.json({ message: 'Запись обновлена' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение рациона за день
    async getDailyFood(req, res) {
        try {
            const userId = req.user.userId;
            const { date } = req.query; 

            if (!date) {
                return res.status(400).json({ message: 'Параметр date обязателен' });
            }

            const startOfDay = `${date} 00:00:00`;
            const endOfDay = `${date} 23:59:59`;

            const dailyFood = await pool.query(
                `SELECT uf.*, f.name, f.calories, f.proteins, f.fats, f.carbohydrates,
                        json_agg(
                            json_build_object(
                                'nutrient_id', fn.nutrient_id, 
                                'amount', fn.amount, 
                                'name', n.name, 
                                'unit', n.unit
                            )
                        ) FILTER (WHERE fn.nutrient_id IS NOT NULL) AS nutrients
                 FROM user_foods uf
                 JOIN foods f ON uf.food_id = f.id
                 LEFT JOIN food_nutrients fn ON f.id = fn.food_id
                 LEFT JOIN nutrients n ON fn.nutrient_id = n.id
                 WHERE uf.user_id = $1 AND uf.consumed_at BETWEEN $2 AND $3
                 GROUP BY uf.id, f.id
                 ORDER BY uf.consumed_at`,
                [userId, startOfDay, endOfDay]
            );

            const result = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: []
            };

            dailyFood.rows.forEach(row => {
                result[row.meal_type].push(row);
            });

            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new FoodController();