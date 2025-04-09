import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, fetchUserInfo } from '../slices/authSlice';
import spinner from '../assets/spinner.gif';
import { clearMessages } from '../slices/authSlice';
import './Profile.css';

const Profile = () => {
    const { user, loading, error, success} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        weight: '',
        height: '',
        activity_level: '',
    });

    useEffect(() => {
        if (isEditing && user) {
            setFormData({
                username: user.username || '',
                weight: user.weight || '',
                height: user.height || '',
                activity_level: user.activity_level || 'moderate',
            });
        }
        dispatch(clearMessages());
    }, [isEditing, user, dispatch]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {};
        if (formData.username !== user.username) updatedData.username = formData.username;
        if (formData.weight !== user.weight) updatedData.weight = formData.weight;
        if (formData.height !== user.height) updatedData.height = formData.height;
        if (formData.activity_level !== user.activity_level) updatedData.activity_level = formData.activity_level;

        if (Object.keys(updatedData).length > 0) {
            dispatch(updateProfile(updatedData)).then((result) => {
                if (result.meta.requestStatus === 'fulfilled') {
                    dispatch(fetchUserInfo()).then(() => {
                        setIsEditing(false);
                    });
                }
            });
        } else {
            setIsEditing(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-wrapper">
                <div className="profile-container">
                    <img src={spinner} alt="Loading" className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <h2 className="profile-title">Мой профиль</h2>
                <div className="profile-card">
                    <div className="profile-header">
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="edit-username"
                                placeholder="Введите имя"
                            />
                        ) : (
                            <span className="profile-username">{user.username}</span>
                        )}
                    </div>
                    <div className="profile-details">
                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <h3>Личные данные</h3>
                                <div className="form-group">
                                    <label>Вес (кг):</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Рост (см):</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Уровень активности:</label>
                                    <select
                                        name="activity_level"
                                        value={formData.activity_level}
                                        onChange={handleChange}
                                        className="edit-select"
                                    >
                                        <option value="sedentary">Сидячий</option>
                                        <option value="light">Лёгкий</option>
                                        <option value="moderate">Умеренный</option>
                                        <option value="active">Активный</option>
                                        <option value="very_active">Очень активный</option>
                                    </select>
                                </div>
                                {error && <p className="error">{error}</p>}
                                {success && <p className="success">{success}</p>}
                                <div className="form-actions">
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? <img src={spinner} alt="Loading" className="spinner-btn" /> : 'Сохранить'}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h3>Личные данные</h3>
                                <ul className="profile-list">
                                    <li><span className="label">Вес:</span> <span className="value">{user.weight} кг</span></li>
                                    <li><span className="label">Рост:</span> <span className="value">{user.height} см</span></li>
                                    <li><span className="label">Возраст:</span> <span className="value">{user.age} лет</span></li>
                                    <li><span className="label">Пол:</span> <span className="value">{user.gender === 'male' ? 'Мужской' : 'Женский'}</span></li>
                                    <li><span className="label">Активность:</span> <span className="value">{
                                        user.activity_level === 'sedentary' ? 'Сидячий' :
                                            user.activity_level === 'light' ? 'Лёгкий' :
                                                user.activity_level === 'moderate' ? 'Умеренный' :
                                                    user.activity_level === 'active' ? 'Активный' : 'Очень активный'
                                    }</span></li>
                                </ul>
                                <h3>Цели питания</h3>
                                <ul className="profile-list">
                                    <li><span className="label">Калории:</span> <span className="value">{user.daily_calories_goal?.toFixed(0)} ккал</span></li>
                                    <li><span className="label">Белки:</span> <span className="value">{user.daily_proteins_goal} г</span></li>
                                    <li><span className="label">Жиры:</span> <span className="value">{user.daily_fats_goal} г</span></li>
                                    <li><span className="label">Углеводы:</span> <span className="value">{user.daily_carbs_goal} г</span></li>
                                </ul>
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    Редактировать
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;