import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateFood, clearMessages } from '../slices/foodSlice';
import { fetchNutrients } from '../slices/nutrientSlice';
import spinner from '../assets/spinner.gif';
import styles from './Foods.module.css';

const EditFood = () => {
  const { user } = useSelector((state) => state.auth);
  const { foods, loading: foodLoading, formError, success } = useSelector((state) => state.food);
  const { nutrients, loading: nutrientLoading, error: nutrientError } = useSelector((state) => state.nutrient);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const food = foods.find((f) => f.id === parseInt(id));

  const [formData, setFormData] = useState({
    foodId: '',
    name: '',
    calories: '',
    proteins: '',
    fats: '',
    carbohydrates: '',
  });
  const [selectedNutrients, setSelectedNutrients] = useState([]);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(fetchNutrients());
    if (food) {
      setFormData({
        foodId: food.id,
        name: food.name,
        calories: food.calories.toString(),
        proteins: food.proteins.toString(),
        fats: food.fats.toString(),
        carbohydrates: food.carbohydrates.toString(),
      });
      setSelectedNutrients(
        food.nutrients && food.nutrients.length > 0
          ? food.nutrients.map((n) => ({
              nutrient_id: n.nutrient_id.toString(),
              amount: n.amount.toString(),
            }))
          : []
      );
    }
  }, [dispatch, food]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const handleNutrientChange = (index, field, value) => {
    const updatedNutrients = [...selectedNutrients];
    updatedNutrients[index] = { ...updatedNutrients[index], [field]: value };
    setSelectedNutrients(updatedNutrients);
  };

  const addNutrient = () => {
    setSelectedNutrients([...selectedNutrients, { nutrient_id: '', amount: '' }]);
  };

  const removeNutrient = (index) => {
    setSelectedNutrients(selectedNutrients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.name.trim()) {
      setLocalError('Название обязательно');
      return;
    }
    if (!formData.calories || isNaN(formData.calories) || formData.calories <= 0) {
      setLocalError('Калории должны быть положительным числом');
      return;
    }
    if (!formData.proteins || isNaN(formData.proteins) || formData.proteins < 0) {
      setLocalError('Белки должны быть неотрицательным числом');
      return;
    }
    if (!formData.fats || isNaN(formData.fats) || formData.fats < 0) {
      setLocalError('Жиры должны быть неотрицательным числом');
      return;
    }
    if (!formData.carbohydrates || isNaN(formData.carbohydrates) || formData.carbohydrates < 0) {
      setLocalError('Углеводы должны быть неотрицательным числом');
      return;
    }

    for (let i = 0; i < selectedNutrients.length; i++) {
      const nutrient = selectedNutrients[i];
      if (!nutrient.nutrient_id) {
        setLocalError(`Выберите нутриент для поля ${i + 1}`);
        return;
      }
      if (!nutrient.amount || isNaN(nutrient.amount) || nutrient.amount <= 0) {
        setLocalError(`Укажите положительное количество для нутриента ${i + 1}`);
        return;
      }
    }

    const nutrientIds = selectedNutrients.map((n) => n.nutrient_id);
    if (new Set(nutrientIds).size !== nutrientIds.length) {
      setLocalError('Нельзя выбирать один и тот же нутриент несколько раз');
      return;
    }

    dispatch(clearMessages());
    dispatch(
      updateFood({
        foodId: parseInt(formData.foodId),
        name: formData.name.trim(),
        calories: parseFloat(formData.calories),
        proteins: parseFloat(formData.proteins),
        fats: parseFloat(formData.fats),
        carbohydrates: parseFloat(formData.carbohydrates),
        nutrients: selectedNutrients.map((n) => ({
          nutrient_id: parseInt(n.nutrient_id),
          amount: parseFloat(n.amount),
        })),
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/foods');
      }
    });
  };

  if (!user || !food || !food.user_id) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <img src={spinner} alt="Loading" className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Редактировать продукт</h2>
        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Название:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите уникальное название"
                disabled={foodLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Калории (ккал):</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите калории"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Белки (г):</label>
              <input
                type="number"
                name="proteins"
                value={formData.proteins}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите белки"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Жиры (г):</label>
              <input
                type="number"
                name="fats"
                value={formData.fats}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите жиры"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Углеводы (г):</label>
              <input
                type="number"
                name="carbohydrates"
                value={formData.carbohydrates}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите углеводы"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Нутриенты:</label>
              {nutrientLoading ? (
                <p>Загрузка нутриентов...</p>
              ) : nutrientError ? (
                <p className={styles.error}>{nutrientError}</p>
              ) : nutrients.length > 0 ? (
                <>
                  {selectedNutrients.map((nutrient, index) => (
                    <div key={index} className={styles.nutrientRow}>
                      <select
                        value={nutrient.nutrient_id}
                        onChange={(e) => handleNutrientChange(index, 'nutrient_id', e.target.value)}
                        className={`${styles.input} ${styles.nutrientSelect}`}
                        disabled={foodLoading}
                      >
                        <option value="">Выберите нутриент</option>
                        {nutrients.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={nutrient.amount}
                        onChange={(e) => handleNutrientChange(index, 'amount', e.target.value)}
                        className={`${styles.input} ${styles.nutrientAmount}`}
                        placeholder="Количество"
                        step="0.01"
                        min="0"
                        disabled={foodLoading}
                      />
                      <button
                        type="button"
                        className={styles.removeNutrientBtn}
                        onClick={() => removeNutrient(index)}
                        disabled={foodLoading}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addNutrientBtn}
                    onClick={addNutrient}
                    disabled={foodLoading}
                  >
                    Добавить нутриент
                  </button>
                </>
              ) : (
                <p>Нутриенты не найдены</p>
              )}
            </div>

            {localError && <p className={styles.error}>{localError}</p>}
            {formError && <p className={styles.error}>{formError}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/foods')}
                disabled={foodLoading}
              >
                Отмена
              </button>
              <button type="submit" className={styles.saveBtn} disabled={foodLoading}>
                {foodLoading ? <img src={spinner} alt="Loading" className={styles.spinnerBtn} /> : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFood;