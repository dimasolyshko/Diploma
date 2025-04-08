import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, fetchUserInfo } from '../slices/authSlice';
import './Header.css';

const Header = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserInfo());
    }
  }, [token, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">
          <Link to="/">Healthy Eating</Link>
        </h1>
        <nav className="nav">
          {token ? (
            <div className="auth-nav">
              <span className="username">{user?.username || ''}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <div className="unauth-nav">
              <Link to="/login" className="nav-link">Войти</Link>
              <Link to="/register" className="nav-link">Регистрация</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;