import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addFood, clearMessages } from '../slices/foodSlice';
import { fetchNutrients } from '../slices/nutrientSlice';
import spinner from '../assets/spinner.gif';
import './Foods.css';

const AddFood = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading: foodLoading, formError, success } = useSelector((state) => state.food);
  const { nutrients, loading: nutrientLoading, error: nutrientError } = useSelector((state) => state.nutrient);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
  }, [dispatch]);

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
      addFood({
        name: formData.name.trim(),
        calories: parseFloat(formData.calories),
        proteins: parseFloat(formData.proteins),
        fats: parseFloat(formData.fats),
        carbohydrates: parseFloat(formData.carbohydrates),
        nutrients: selectedNutrients,
      })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setFormData({
          name: '',
          calories: '',
          proteins: '',
          fats: '',
          carbohydrates: '',
        });
        setSelectedNutrients([]);
        navigate('/foods');
      }
    });
  };

  if (!user) {
    return (
      <div className="foods-wrapper">
        <div className="foods-container">
          <img src={spinner} alt="Loading" className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="foods-wrapper">
      <div className="foods-container">
        <h2 className="foods-title">Добавить продукт</h2>
        <div className="foods-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="foods-input"
                placeholder="Введите уникальное название"
                disabled={foodLoading}
              />
            </div>
            <div className="form-group">
              <label>Калории (ккал):</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                className="foods-input"
                placeholder="Введите калории"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className="form-group">
              <label>Белки (г):</label>
              <input
                type="number"
                name="proteins"
                value={formData.proteins}
                onChange={handleChange}
                className="foods-input"
                placeholder="Введите белки"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className="form-group">
              <label>Жиры (г):</label>
              <input
                type="number"
                name="fats"
                value={formData.fats}
                onChange={handleChange}
                className="foods-input"
                placeholder="Введите жиры"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>
            <div className="form-group">
              <label>Углеводы (г):</label>
              <input
                type="number"
                name="carbohydrates"
                value={formData.carbohydrates}
                onChange={handleChange}
                className="foods-input"
                placeholder="Введите углеводы"
                step="0.1"
                min="0"
                disabled={foodLoading}
              />
            </div>

            <div className="form-group">
              <label>Нутриенты:</label>
              {nutrientLoading ? (
                <p>Загрузка нутриентов...</p>
              ) : nutrientError ? (
                <p className="error">{nutrientError}</p>
              ) : nutrients.length > 0 ? (
                <>
                  {selectedNutrients.map((nutrient, index) => (
                    <div key={index} className="nutrient-row">
                      <select
                        value={nutrient.nutrient_id}
                        onChange={(e) => handleNutrientChange(index, 'nutrient_id', e.target.value)}
                        className="foods-input nutrient-select"
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
                        className="foods-input nutrient-amount"
                        placeholder="Количество"
                        step="0.01"
                        min="0"
                        disabled={foodLoading}
                      />
                      <button
                        type="button"
                        className="remove-nutrient-btn"
                        onClick={() => removeNutrient(index)}
                        disabled={foodLoading}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-nutrient-btn"
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

            {localError && <p className="error">{localError}</p>}
            {formError && <p className="error">{formError}</p>}
            {success && <p className="success">{success}</p>}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/foods')}
                disabled={foodLoading}
              >
                Отмена
              </button>
              <button type="submit" className="save-btn" disabled={foodLoading}>
                {foodLoading ? <img src={spinner} alt="Loading" className="spinner-btn" /> : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;