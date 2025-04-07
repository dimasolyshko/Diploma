import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Register.css'; // Импортируем стили

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/users/register', formData);
      setSuccess('Регистрация успешна! Перенаправляем на страницу входа...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Ошибка запроса:', err.response);
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Имя:</label>
          <input name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Вес (кг):</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Рост (см):</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Возраст:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Пол:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <div className="form-group">
          <label>Уровень активности:</label>
          <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
            <option value="sedentary">Сидячий</option>
            <option value="light">Лёгкий</option>
            <option value="moderate">Умеренный</option>
            <option value="active">Активный</option>
            <option value="very_active">Очень активный</option>
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Register;