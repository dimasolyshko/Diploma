import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Privacy from './pages/Privacy';
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import FoodsList from './pages/FoodsList';
import AddFood from './pages/AddFood';
import EditFood from './pages/EditFood';
import Diet from './pages/Diet';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PrivateRoute>
                <Privacy />
              </PrivateRoute>
            }
          />
          <Route
            path="/foods"
            element={
              <PrivateRoute>
                <FoodsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/foods/add"
            element={
              <PrivateRoute>
                <AddFood />
              </PrivateRoute>
            }
          />
          <Route
            path="/foods/edit/:id"
            element={
              <PrivateRoute>
                <EditFood />
              </PrivateRoute>
            }
          />
          <Route
            path="/diet"
            element={
              <PrivateRoute>
                <Diet />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<div className="welcome">Добро пожаловать в Healthy Eating App!</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;