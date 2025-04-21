import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Navigation.module.css';

const Navigation = () => {
  const { token } = useSelector((state) => state.auth);

  if (!token) return null;

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <NavLink
          to="/profile"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Профиль
        </NavLink>
        <NavLink
          to="/privacy"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Конфиденциальность
        </NavLink>
        <NavLink
          to="/foods"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Продукты
        </NavLink>
        <NavLink
          to="/diet"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Рацион
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Статистика
        </NavLink>
        
      </div>
    </nav>
  );
};

export default Navigation;