import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { setAuthToken } from './utils/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  return (
    <div>
      <h1>Healthy Eating App</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<div>Добро пожаловать! <a href="/login">Войти</a> | <a href="/register">Регистрация</a></div>} />
      </Routes>
    </div>
  );
}

export default App;