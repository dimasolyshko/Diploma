import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFoods, clearMessages, deleteFood } from '../slices/foodSlice';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import spinner from '../assets/spinner.gif';
import styles from './Foods.module.css';

const FoodsList = () => {
  const { user } = useSelector((state) => state.auth);
  const { foods, loading, listError, formError } = useSelector((state) => state.food);
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

  const handleDelete = (foodId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      dispatch(deleteFood(foodId));
    }
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
        <h2 className={styles.title}>Продукты</h2>
        <div className={styles.card}>
          <h3>Список продуктов</h3>
          {loading ? (
            <img src={spinner} alt="Loading" className={styles.spinner} />
          ) : listError ? (
            <p className={styles.error}>{listError}</p>
          ) : foods.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className={styles.sortable}>
                      Название{' '}
                      {sortConfig.key === 'name' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('calories')} className={styles.sortable}>
                      Калории (ккал){' '}
                      {sortConfig.key === 'calories' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('proteins')} className={styles.sortable}>
                      Белки (г){' '}
                      {sortConfig.key === 'proteins' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('fats')} className={styles.sortable}>
                      Жиры (г){' '}
                      {sortConfig.key === 'fats' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('carbohydrates')}
                      className={styles.sortable}
                    >
                      Углеводы (г){' '}
                      {sortConfig.key === 'carbohydrates' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Нутриенты</th>
                    <th onClick={() => handleSort('type')} className={styles.sortable}>
                      Тип{' '}
                      {sortConfig.key === 'type' &&
                        (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Действия</th>
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
                          <ul className={styles.nutrientsList}>
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
                      <td>
                        {food.user_id && (
                          <div className={styles.actionButtons}>
                            <Link to={`/foods/edit/${food.id}`} className={styles.editBtn}>
                              <FaPencilAlt className={styles.icon} />
                            </Link>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(food.id)}
                              disabled={loading}
                            >
                              <FaTrash className={styles.icon} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Продукты пока не добавлены</p>
          )}
          {formError && <p className={styles.error}>{formError}</p>}
          <div className={styles.formActions}>
            <Link to="/foods/add" className={styles.saveBtn}>
              Добавить
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodsList;