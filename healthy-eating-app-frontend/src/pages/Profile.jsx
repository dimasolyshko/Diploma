import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, fetchUserInfo } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import { clearMessages } from '../slices/authSlice';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, loading, error, success } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    weight: '',
    height: '',
    activity_level: '',
  });

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username || '',
        weight: user.weight || '',
        height: user.height || '',
        activity_level: user.activity_level || 'moderate',
      });
    }
    dispatch(clearMessages());
  }, [isEditing, user, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {};
    if (formData.username !== user.username) updatedData.username = formData.username;
    if (formData.weight !== user.weight) updatedData.weight = formData.weight;
    if (formData.height !== user.height) updatedData.height = formData.height;
    if (formData.activity_level !== user.activity_level)
      updatedData.activity_level = formData.activity_level;

    if (Object.keys(updatedData).length > 0) {
      dispatch(updateProfile(updatedData)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          dispatch(fetchUserInfo()).then(() => {
            setIsEditing(false);
          });
        }
      });
    } else {
      setIsEditing(false);
    }
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
        <h2 className={styles.title}>Мой профиль</h2>
        <div className={styles.card}>
          <div className={styles.header}>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.editUsername}
                placeholder="Введите имя"
              />
            ) : (
              <span className={styles.username}>{user.username}</span>
            )}
          </div>
          <div className={styles.details}>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <h3>Личные данные</h3>
                <div className={styles.formGroup}>
                  <label>Вес (кг):</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Рост (см):</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Уровень активности:</label>
                  <select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="sedentary">Сидячий</option>
                    <option value="light">Лёгкий</option>
                    <option value="moderate">Умеренный</option>
                    <option value="active">Активный</option>
                    <option value="very_active">Очень активный</option>
                  </select>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn} disabled={loading}>
                    {loading ? (
                      <img src={spinner} alt="Loading" className={styles.spinnerBtn} />
                    ) : (
                      'Сохранить'
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3>Личные данные</h3>
                <ul className={styles.list}>
                  <li>
                    <span className={styles.label}>Вес:</span>{' '}
                    <span className={styles.value}>{user.weight} кг</span>
                  </li>
                  <li>
                    <span className={styles.label}>Рост:</span>{' '}
                    <span className={styles.value}>{user.height} см</span>
                  </li>
                  <li>
                    <span className={styles.label}>Возраст:</span>{' '}
                    <span className={styles.value}>{user.age} лет</span>
                  </li>
                  <li>
                    <span className={styles.label}>Пол:</span>{' '}
                    <span className={styles.value}>
                      {user.gender === 'male' ? 'Мужской' : 'Женский'}
                    </span>
                  </li>
                  <li>
                    <span className={styles.label}>Активность:</span>{' '}
                    <span className={styles.value}>
                      {user.activity_level === 'sedentary'
                        ? 'Сидячий'
                        : user.activity_level === 'light'
                        ? 'Лёгкий'
                        : user.activity_level === 'moderate'
                        ? 'Умеренный'
                        : user.activity_level === 'active'
                        ? 'Активный'
                        : 'Очень активный'}
                    </span>
                  </li>
                </ul>
                <h3>Цели питания</h3>
                <ul className={styles.list}>
                  <li>
                    <span className={styles.label}>Калории:</span>{' '}
                    <span className={styles.value}>
                      {user.daily_calories_goal?.toFixed(0)} ккал
                    </span>
                  </li>
                  <li>
                    <span className={styles.label}>Белки:</span>{' '}
                    <span className={styles.value}>{user.daily_proteins_goal} г</span>
                  </li>
                  <li>
                    <span className={styles.label}>Жиры:</span>{' '}
                    <span className={styles.value}>{user.daily_fats_goal} г</span>
                  </li>
                  <li>
                    <span className={styles.label}>Углеводы:</span>{' '}
                    <span className={styles.value}>{user.daily_carbs_goal} г</span>
                  </li>
                </ul>
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  Редактировать
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;