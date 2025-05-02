import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyStats, fetchWeeklyStats, clearMessages } from '../slices/foodSlice';
import { fetchUserInfo } from '../slices/authSlice';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import spinner from '../assets/spinner.gif';
import styles from './Stats.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Stats = () => {
  const dispatch = useDispatch();
  const { user, userLoading } = useSelector((state) => state.auth);
  const { stats, statsLoading, statsError } = useSelector((state) => state.food);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWeekStartDate = () => {
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() - 6);
    return endDate.toISOString().split('T')[0];
  };

  const getSafeNumber = (value) => {
    if (value == null) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    dispatch(fetchUserInfo());
    if (viewMode === 'day') {
      dispatch(fetchDailyStats(selectedDate));
    } else {
      dispatch(fetchWeeklyStats(selectedDate));
    }
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, selectedDate, viewMode]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (!user || userLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <img src={spinner} alt="Loading" className={styles.spinner} />
        </div>
      </div>
    );
  }

  const targetRatios = {
    proteins: 30,
    fats: 20,
    carbohydrates: 50
  };

  const getRecommendedGrams = (type) => {
    if (!user.daily_calories_goal) return 0;
    if (type === 'proteins') {
      return (user.daily_calories_goal * targetRatios.proteins / 100 / 4).toFixed(0);
    }
    if (type === 'fats') {
      return (user.daily_calories_goal * targetRatios.fats / 100 / 9).toFixed(0);
    }
    if (type === 'carbohydrates') {
      return (user.daily_calories_goal * targetRatios.carbohydrates / 100 / 4).toFixed(0);
    }
    return 0;
  };

  const getRecommendation = (type, currentValue, goal) => {
    if (!stats || currentValue == null) {
      return { message: 'Норма', status: 'Норма' };
    }

    const adjustedValue = viewMode === 'week' ? currentValue / 7 : currentValue;

    if (type === 'calories') {
      if (adjustedValue < goal * 0.8) {
        return {
          status: 'Недобор',
          message: `Недостаточно калорий в организме${viewMode === 'week' ? ' в среднем за неделю: ' : ': '} Вам следует кушать больше${viewMode === 'week' ? '' : ', пока день не закончился'}.`
        };
      }
      if (adjustedValue > goal * 1.2) {
        return {
          status: 'фПеребор',
          message: `Перебор калорий: Старайтесь кушать умеренно и не переедать${viewMode === 'week' ? ' в среднем за неделю' : ''}.`
        };
      }
      return {
        status: 'Норма',
        message: `Отлично, калории в норме${viewMode === 'week' ? ' в среднем за неделю' : ''}!`
      };
    }

    const target = targetRatios[type];
    const threshold = target * 0.2; 
    const minThreshold = target - threshold;
    const maxThreshold = target + threshold;

    if (adjustedValue < minThreshold) {
      return {
        status: 'Недобор',
        message: `Недостаточно ${type === 'proteins' ? 'белков' : type === 'fats' ? 'жиров' : 'углеводов'}${viewMode === 'week' ? ' в среднем за неделю' : ''}. Попробуйте добавить ${type === 'proteins' ? 'курицу, яйца или рыбу, а также остальные продукты, содержащие много белка' : type === 'fats' ? 'авокадо, орехи или масло, а также остальные продукты, содержащие много жиров' : 'цельнозерновые продукты или фрукты, а также остальные продукты, содержащие много углеводов'}.`
      };
    }

    if (adjustedValue > maxThreshold) {
      return {
        status: 'Перебор',
        message: `Слишком много ${type === 'proteins' ? 'белков' : type === 'fats' ? 'жиров' : 'углеводов'}${viewMode === 'week' ? ' в среднем за неделю' : ''}. В следующий раз ешь меньше ${type === 'proteins' ? 'мяса, рыбы или яиц, а также остальные продукты, содержащие много белка' : type === 'fats' ? 'орехов, масла или жирных продуктов, а также остальные продукты, содержащие много жиров' : 'хлеба, круп или сладостей, а также остальные продукты, содержащие много углеводов'}.`
      };
    }

    return {
      status: 'Норма',
      message: `Отлично, ${type === 'proteins' ? 'белки' : type === 'fats' ? 'жиры' : 'углеводы'} в норме${viewMode === 'week' ? ' в среднем за неделю' : ''}!`
    };
  };

  const pieData = stats && stats.bju_ratios ? {
    labels: ['Белки', 'Жиры', 'Углеводы'],
    datasets: [{
      data: [
        viewMode === 'week' ? getSafeNumber(stats.bju_ratios.proteins) / 7 : getSafeNumber(stats.bju_ratios.proteins),
        viewMode === 'week' ? getSafeNumber(stats.bju_ratios.fats) / 7 : getSafeNumber(stats.bju_ratios.fats),
        viewMode === 'week' ? getSafeNumber(stats.bju_ratios.carbohydrates) / 7 : getSafeNumber(stats.bju_ratios.carbohydrates)
      ],
      backgroundColor: ['#28a745', '#ffc107', '#007bff'],
      hoverOffset: 4
    }]
  } : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Статистика {viewMode === 'day' ? 'за день' : 'за неделю'}</h2>
        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label>Выберите дату:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={styles.input}
              disabled={statsLoading}
            />
          </div>
          {viewMode === 'week' && (
            <p className={styles.dateRange}>
              Период: {formatDate(getWeekStartDate())} – {formatDate(selectedDate)}
            </p>
          )}
          <div className={styles.viewModeButtons}>
            <button
              className={`${styles.viewButton} ${viewMode === 'day' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('day')}
              disabled={statsLoading}
            >
              День
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'week' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('week')}
              disabled={statsLoading}
            >
              Неделя
            </button>
          </div>

          {statsLoading ? (
            <img src={spinner} alt="Loading" className={styles.spinner} />
          ) : statsError ? (
            <p className={styles.error}>{statsError}</p>
          ) : stats && stats.bju_ratios ? (
            <>
              <h3 className={styles.sectionTitle}>КБЖУ</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Показатель</th>
                    <th>Текущее</th>
                    <th>Рекомендация</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Калории (ккал)</td>
                    <td>
                      {(viewMode === 'week' ? getSafeNumber(stats.total_calories) / 7 : getSafeNumber(stats.total_calories)).toFixed(0)}
                    </td>
                    <td>{getSafeNumber(user.daily_calories_goal).toFixed(1)}</td>
                    <td className={getRecommendation('calories', getSafeNumber(stats.total_calories), getSafeNumber(user.daily_calories_goal)).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('calories', getSafeNumber(stats.total_calories), getSafeNumber(user.daily_calories_goal)).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('calories', getSafeNumber(stats.total_calories), getSafeNumber(user.daily_calories_goal)).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Белки</td>
                    <td>
                      {`${(viewMode === 'week' ? getSafeNumber(stats.bju_ratios.proteins) / 7 : getSafeNumber(stats.bju_ratios.proteins)).toFixed(1)}% (${(viewMode === 'week' ? getSafeNumber(stats.total_proteins) / 7 : getSafeNumber(stats.total_proteins)).toFixed(0)} г)`}
                    </td>
                    <td>{`${targetRatios.proteins}% (~${getRecommendedGrams('proteins')} г)`}</td>
                    <td className={getRecommendation('proteins', getSafeNumber(stats.bju_ratios.proteins)).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('proteins', getSafeNumber(stats.bju_ratios.proteins)).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('proteins', getSafeNumber(stats.bju_ratios.proteins)).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Жиры</td>
                    <td>
                      {`${(viewMode === 'week' ? getSafeNumber(stats.bju_ratios.fats) / 7 : getSafeNumber(stats.bju_ratios.fats)).toFixed(1)}% (${(viewMode === 'week' ? getSafeNumber(stats.total_fats) / 7 : getSafeNumber(stats.total_fats)).toFixed(0)} г)`}
                    </td>
                    <td>{`${targetRatios.fats}% (~${getRecommendedGrams('fats')} г)`}</td>
                    <td className={getRecommendation('fats', getSafeNumber(stats.bju_ratios.fats)).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('fats', getSafeNumber(stats.bju_ratios.fats)).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('fats', getSafeNumber(stats.bju_ratios.fats)).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Углеводы</td>
                    <td>
                      {`${(viewMode === 'week' ? getSafeNumber(stats.bju_ratios.carbohydrates) / 7 : getSafeNumber(stats.bju_ratios.carbohydrates)).toFixed(1)}% (${(viewMode === 'week' ? getSafeNumber(stats.total_carbohydrates) / 7 : getSafeNumber(stats.total_carbohydrates)).toFixed(0)} г)`}
                    </td>
                    <td>{`${targetRatios.carbohydrates}% (~${getRecommendedGrams('carbohydrates')} г)`}</td>
                    <td className={getRecommendation('carbohydrates', getSafeNumber(stats.bju_ratios.carbohydrates)).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('carbohydrates', getSafeNumber(stats.bju_ratios.carbohydrates)).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('carbohydrates', getSafeNumber(stats.bju_ratios.carbohydrates)).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3 className={styles.sectionTitle}>Рекомендации</h3>
              <ul className={styles.recommendations}>
                {[
                  getRecommendation('calories', getSafeNumber(stats.total_calories), getSafeNumber(user.daily_calories_goal)),
                  getRecommendation('proteins', getSafeNumber(stats.bju_ratios.proteins)),
                  getRecommendation('fats', getSafeNumber(stats.bju_ratios.fats)),
                  getRecommendation('carbohydrates', getSafeNumber(stats.bju_ratios.carbohydrates))
                ].map((rec, index) => (
                  <li key={index}>
                    {rec.message}
                  </li>
                ))}
              </ul>

              <h3 className={styles.sectionTitle}>Распределение БЖУ</h3>
              <div className={styles.chart}>
                {pieData ? (
                  <Pie data={pieData} options={{
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.label}: ${context.parsed}%`
                        }
                      }
                    }
                  }} />
                ) : (
                  <p>Данные для графика отсутствуют</p>
                )}
              </div>

              <h3 className={styles.sectionTitle}>Нутриенты</h3>
              {stats.nutrients && stats.nutrients.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Нутриент</th>
                      <th>Количество</th>
                      <th>Единица</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.nutrients.map((nutrient) => (
                      <tr key={nutrient.nutrient_id}>
                        <td>{nutrient.name}</td>
                        <td>{(viewMode === 'week' ? getSafeNumber(nutrient.amount) / 7 : getSafeNumber(nutrient.amount)).toFixed(2)}</td>
                        <td>{nutrient.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Нутриенты не потреблялись за этот {viewMode === 'day' ? 'день' : 'неделю'}.</p>
              )}
            </>
          ) : (
            <p>Данные за выбранный {viewMode === 'day' ? 'день' : 'неделю'} отсутствуют.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;