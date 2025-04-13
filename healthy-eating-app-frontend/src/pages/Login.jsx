import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, fetchUserInfo, clearMessages } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearMessages());
    dispatch(login({ email, password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchUserInfo()).then((userResult) => {
          if (userResult.meta.requestStatus === 'fulfilled') {
            setTimeout(() => navigate('/'), 1000);
          }
        });
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <img src={spinner} alt="Loading" className={styles.spinner} /> : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default Login;