import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, fetchUserInfo } from '../slices/authSlice';
import styles from './Header.module.css';

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
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.logo}>
          <Link to="/">Healthy Eating</Link>
        </h1>
        <nav className={styles.nav}>
          {token ? (
            <div className={styles.authNav}>
              <Link to="/profile" className={styles.navLink}>
                {user?.username || ''}
              </Link>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <div className={styles.unauthNav}>
              <Link to="/login" className={styles.navLink}>Войти</Link>
              <Link to="/register" className={styles.navLink}>Регистрация</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;