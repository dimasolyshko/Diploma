import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFoods, clearMessages } from '../slices/foodSlice';
import spinner from '../assets/spinner.gif';
import './Foods.css';

const FoodsList = () => {
  const { user } = useSelector((state) => state.auth);
  const { foods, loading, listError } = useSelector((state) => state.food);
  const dispatch = useDispatch();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  useEffect(() => {
    dispatch(fetchFoods());
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedFoods = () => {
    if (!sortConfig.key) return foods;

    const sortedFoods = [...foods];
    sortedFoods.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'type') {
        aValue = a.user_id ? 'Ваш' : 'Общий';
        bValue = b.user_id ? 'Ваш' : 'Общий';
      }

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortConfig.direction === 'asc') {
        return typeof aValue === 'string'
          ? aValue.localeCompare(bValue)
          : aValue - bValue;
      } else {
        return typeof aValue === 'string'
          ? bValue.localeCompare(aValue)
          : bValue - aValue;
      }
    });
    return sortedFoods;
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
        <h2 className="foods-title">Продукты</h2>
        <div className="foods-card">
          <h3>Список продуктов</h3>
          {loading ? (
            <img src={spinner} alt="Loading" className="spinner" />
          ) : listError ? (
            <p className="error">{listError}</p>
          ) : foods.length > 0 ? (
            <div className="foods-table-wrapper">
              <table className="foods-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Название{' '}
                      {sortConfig.key === 'name' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('calories')} className="sortable">
                      Калории (ккал){' '}
                      {sortConfig.key === 'calories' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('proteins')} className="sortable">
                      Белки (г){' '}
                      {sortConfig.key === 'proteins' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('fats')} className="sortable">
                      Жиры (г){' '}
                      {sortConfig.key === 'fats' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('carbohydrates')}
                      className="sortable"
                    >
                      Углеводы (г){' '}
                      {sortConfig.key === 'carbohydrates' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Нутриенты</th>
                    <th onClick={() => handleSort('type')} className="sortable">
                      Тип{' '}
                      {sortConfig.key === 'type' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedFoods().map((food) => (
                    <tr key={food.id}>
                      <td>{food.name}</td>
                      <td>{food.calories}</td>
                      <td>{food.proteins}</td>
                      <td>{food.fats}</td>
                      <td>{food.carbohydrates}</td>
                      <td>
                        {food.nutrients && food.nutrients.length > 0 ? (
                          <ul className="nutrients-list">
                            {food.nutrients.map((nutrient) => (
                              <li key={nutrient.nutrient_id}>
                                {nutrient.name}: {nutrient.amount} {nutrient.unit}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'не указаны'
                        )}
                      </td>
                      <td>{food.user_id ? 'Ваш' : 'Общий'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Продукты пока не добавлены</p>
          )}
          <div className="form-actions">
            <Link to="/foods/add" className="save-btn">
              Добавить
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodsList;