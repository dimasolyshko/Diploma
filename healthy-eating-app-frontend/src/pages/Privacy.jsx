import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePassword, clearMessages } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import styles from './Privacy.module.css';

const Privacy = () => {
  const { loading, error, success } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePassword(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setFormData({ oldPassword: '', newPassword: '' });
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Конфиденциальность</h2>
        <div className={styles.card}>
          <h3>Изменение пароля</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Старый пароль:</label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите текущий пароль"
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Новый пароль:</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите новый пароль"
                disabled={loading}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? (
                  <img src={spinner} alt="Loading" className={styles.spinnerBtn} />
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Privacy;