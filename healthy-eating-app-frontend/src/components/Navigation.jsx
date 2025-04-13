import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Navigation.css';

const Navigation = () => {
  const { token } = useSelector((state) => state.auth);

  if (!token) return null;

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Профиль
        </NavLink>
        <NavLink to="/privacy" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Конфиденциальность
        </NavLink>
        <NavLink to="/foods"  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          Продукты
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;