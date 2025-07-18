import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activity_level: 'moderate',
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setTimeout(() => navigate('/login'), 1000);
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Имя:</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Пароль:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Вес (кг):</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className={styles.input}
            required
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
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Возраст:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Пол:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={styles.select}>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
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
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <img src={spinner} alt="Loading" className={styles.spinner} /> : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Register;