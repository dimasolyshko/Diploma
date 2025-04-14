import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFoods } from '../slices/foodSlice';
import { fetchDailyFood, logFood, updateFoodLog, deleteFoodLog, clearMessages } from '../slices/dietSlice';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import styles from './Diet.module.css';

const mealTypes = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

const Diet = () => {
  const dispatch = useDispatch();
  const { foods } = useSelector((state) => state.food);
  const { dailyFood, loading, error, success } = useSelector((state) => state.diet);

  const [form, setForm] = useState({
    foodId: '',
    portionSize: '',
    mealType: 'breakfast',
  });
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    console.log('Diet: Загрузка данных', { today });
    dispatch(fetchFoods());
    dispatch(fetchDailyFood(today));
    return () => dispatch(clearMessages());
  }, [dispatch]);

  useEffect(() => {
    if (success === 'Продукт добавлен') {
      const today = new Date().toISOString().split('T')[0];
      console.log('Diet: Обновление рациона после добавления', { today });
      dispatch(fetchDailyFood(today));
    }
  }, [success, dispatch]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.foodId || !form.portionSize || !form.mealType) {
      dispatch(clearMessages());
      dispatch({ type: 'diet/logFood/rejected', payload: 'Заполните все поля' });
      return;
    }
    const data = {
      foodId: Number(form.foodId),
      portionSize: Number(form.portionSize),
      mealType: form.mealType,
    };
    dispatch(logFood(data)).then(() => {
      setForm({ foodId: '', portionSize: '', mealType: 'breakfast' });
    });
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setForm({
      foodId: log.food_id,
      portionSize: log.portion_size,
      mealType: log.meal_type,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!form.portionSize || !form.mealType) {
      dispatch(clearMessages());
      dispatch({ type: 'diet/updateFoodLog/rejected', payload: 'Заполните все поля' });
      return;
    }
    const data = {
      logId: editingLog.id,
      portionSize: Number(form.portionSize),
      mealType: form.mealType,
    };
    dispatch(updateFoodLog(data)).then(() => {
      setEditingLog(null);
      setForm({ foodId: '', portionSize: '', mealType: 'breakfast' });
    });
  };

  const handleCancel = () => {
    setEditingLog(null);
    setForm({ foodId: '', portionSize: '', mealType: 'breakfast' });
  };

  const handleDelete = (logId) => {
    dispatch(deleteFoodLog(logId));
  };

  const calculateMealTotals = (mealLogs) => {
    return (mealLogs || []).reduce(
      (totals, log) => {
        const multiplier = (log.portion_size || 0) / 100;
        return {
          calories: totals.calories + (log.calories || 0) * multiplier,
          proteins: totals.proteins + (log.proteins || 0) * multiplier,
          fats: totals.fats + (log.fats || 0) * multiplier,
          carbohydrates: totals.carbohydrates + (log.carbohydrates || 0) * multiplier,
        };
      },
      { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 }
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Мой рацион</h1>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editingLog ? 'Редактировать запись' : 'Добавить продукт'}
          </h2>
          <form onSubmit={editingLog ? handleUpdate : handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="foodId">Продукт:</label>
              <select
                id="foodId"
                name="foodId"
                value={form.foodId}
                onChange={handleInputChange}
                disabled={editingLog}
                required
              >
                <option value="">Выберите продукт</option>
                {(foods || []).map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="portionSize">Порция (г):</label>
              <input
                id="portionSize"
                name="portionSize"
                type="number"
                min="1"
                step="1"
                value={form.portionSize}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mealType">Приём пищи:</label>
              <select
                id="mealType"
                name="mealType"
                value={form.mealType}
                onChange={handleInputChange}
                required
              >
                {mealTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Загрузка...' : editingLog ? 'Сохранить' : 'Добавить'}
              </button>
              {editingLog && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
        </div>

        {mealTypes.map((type) => {
          const totals = calculateMealTotals(dailyFood[type.value]);
          return (
            <div key={type.value} className={styles.tableCard}>
              <h2 className={styles.tableTitle}>{type.label}</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Продукт</th>
                    <th>Калории (ккал)</th>
                    <th className={styles.hideOnSmall}>Белки (г)</th>
                    <th className={styles.hideOnSmall}>Жиры (г)</th>
                    <th className={styles.hideOnSmall}>Углеводы (г)</th>
                    <th>Порция (г)</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {(dailyFood[type.value] || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className={styles.empty}>
                        Нет продуктов
                      </td>
                    </tr>
                  ) : (
                    dailyFood[type.value].map((log) => {
                      const multiplier = log.portion_size / 100;
                      return (
                        <tr key={log.id}>
                          <td>{log.name || 'Неизвестно'}</td>
                          <td>{((log.calories || 0) * multiplier).toFixed(1)}</td>
                          <td className={styles.hideOnSmall}>
                            {((log.proteins || 0) * multiplier).toFixed(1)}
                          </td>
                          <td className={styles.hideOnSmall}>
                            {((log.fats || 0) * multiplier).toFixed(1)}
                          </td>
                          <td className={styles.hideOnSmall}>
                            {((log.carbohydrates || 0) * multiplier).toFixed(1)}
                          </td>
                          <td>{log.portion_size}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.editButton}
                                onClick={() => handleEdit(log)}
                                title="Редактировать"
                              >
                                <FaPencilAlt className={styles.icon} />
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(log.id)}
                                title="Удалить"
                                disabled={loading}
                              >
                                <FaTrash className={styles.icon} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Итого</td>
                    <td>{totals.calories.toFixed(1)}</td>
                    <td className={styles.hideOnSmall}>{totals.proteins.toFixed(1)}</td>
                    <td className={styles.hideOnSmall}>{totals.fats.toFixed(1)}</td>
                    <td className={styles.hideOnSmall}>{totals.carbohydrates.toFixed(1)}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Diet;