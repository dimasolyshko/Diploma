import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import { updatePassword } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import { clearMessages } from '../slices/authSlice';
import './Privacy.css';

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
        <div className="privacy-wrapper">
            <div className="privacy-container">
                <h2 className="privacy-title">Конфиденциальность</h2>
                <div className="privacy-card">
                    <h3>Изменение пароля</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Старый пароль:</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="privacy-input"
                                placeholder="Введите текущий пароль"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Новый пароль:</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="privacy-input"
                                placeholder="Введите новый пароль"
                                disabled={loading}
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        {success && <p className="success">{success}</p>}
                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? <img src={spinner} alt="Loading" className="spinner-btn" /> : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Privacy;