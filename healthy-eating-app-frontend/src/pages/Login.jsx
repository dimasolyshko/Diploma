import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, fetchUserInfo, clearMessages } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import './Login.css';

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
    <div className="login-container">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? <img src={spinner} alt="Loading" className="spinner" /> : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default Login;