import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyStats, clearMessages } from '../slices/foodSlice';
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

  useEffect(() => {
    dispatch(fetchUserInfo());
    dispatch(fetchDailyStats(selectedDate));
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
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

    if (type === 'calories') {
      if (currentValue < goal * 0.8) {
        return {
          status: 'Недобор',
          message: 'Недостаточно калорий в организме: Вам следует ещё покушать, пока день не закончился.'
        };
      }
      if (currentValue > goal * 1.2) {
        return {
          status: 'Перебор',
          message: 'Перебор калорий: Старайтесь кушать умеренно и не переедать.'
        };
      }
      return {
        status: 'Норма',
        message: 'Отлично, калории в норме!'
      };
    }

    const target = targetRatios[type];
    const threshold = target * 0.2; // 20% от целевого процента
    const minThreshold = target - threshold;
    const maxThreshold = target + threshold;

    if (currentValue < minThreshold) {
      return {
        status: 'Недобор',
        message: `Недостаточно ${type === 'proteins' ? 'белков' : type === 'fats' ? 'жиров' : 'углеводов'}. Попробуйте добавить ${type === 'proteins' ? 'курицу, яйца или рыбу, а также остальные продукты, содержащие много белка' : type === 'fats' ? 'авокадо, орехи или масло, а также остальные продукты, содержащие много жиров' : 'цельнозерновые продукты или фрукты, а также остальные продукты, содержащие много углеводов'}.`
      };
    }

    if (currentValue > maxThreshold) {
      return {
        status: 'Перебор',
        message: `Слишком много ${type === 'proteins' ? 'белков' : type === 'fats' ? 'жиров' : 'углеводов'}. В следующий раз ешь меньше ${type === 'proteins' ? 'мяса, рыбы или яиц, а также остальные продукты, содержащие много белка' : type === 'fats' ? 'орехов, масла или жирных продуктов, а также остальные продукты, содержащие много жиров' : 'хлеба, круп или сладостей, а также остальные продукты, содержащие много углеводов'}.`
      };
    }

    return {
      status: 'Норма',
      message: `Отлично, ${type === 'proteins' ? 'белки' : type === 'fats' ? 'жиры' : 'углеводы'} в норме!`
    };
  };

  const pieData = stats ? {
    labels: ['Белки', 'Жиры', 'Углеводы'],
    datasets: [{
      data: [
        stats.bju_ratios.proteins,
        stats.bju_ratios.fats,
        stats.bju_ratios.carbohydrates
      ],
      backgroundColor: ['#28a745', '#ffc107', '#007bff'],
      hoverOffset: 4
    }]
  } : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Статистика за день</h2>
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

          {statsLoading ? (
            <img src={spinner} alt="Loading" className={styles.spinner} />
          ) : statsError ? (
            <p className={styles.error}>{statsError}</p>
          ) : stats ? (
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
                    <td>{stats.total_calories}</td>
                    <td>{user.daily_calories_goal.toFixed(1)}</td>
                    <td className={getRecommendation('calories', stats.total_calories, user.daily_calories_goal).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('calories', stats.total_calories, user.daily_calories_goal).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('calories', stats.total_calories, user.daily_calories_goal).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Белки</td>
                    <td>{`${stats.bju_ratios.proteins}% (${stats.total_proteins} г)`}</td>
                    <td>{`${targetRatios.proteins}% (~${getRecommendedGrams('proteins')} г)`}</td>
                    <td className={getRecommendation('proteins', stats.bju_ratios.proteins).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('proteins', stats.bju_ratios.proteins).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('proteins', stats.bju_ratios.proteins).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Жиры</td>
                    <td>{`${stats.bju_ratios.fats}% (${stats.total_fats} г)`}</td>
                    <td>{`${targetRatios.fats}% (~${getRecommendedGrams('fats')} г)`}</td>
                    <td className={getRecommendation('fats', stats.bju_ratios.fats).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('fats', stats.bju_ratios.fats).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('fats', stats.bju_ratios.fats).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Углеводы</td>
                    <td>{`${stats.bju_ratios.carbohydrates}% (${stats.total_carbohydrates} г)`}</td>
                    <td>{`${targetRatios.carbohydrates}% (~${getRecommendedGrams('carbohydrates')} г)`}</td>
                    <td className={getRecommendation('carbohydrates', stats.bju_ratios.carbohydrates).status === 'Норма' ? styles.normal : styles.abnormal}>
                      {getRecommendation('carbohydrates', stats.bju_ratios.carbohydrates).status}
                      <span className={styles.statusIcon}>
                        {getRecommendation('carbohydrates', stats.bju_ratios.carbohydrates).status === 'Норма' ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3 className={styles.sectionTitle}>Рекомендации</h3>
              <ul className={styles.recommendations}>
                {[
                  getRecommendation('calories', stats.total_calories, user.daily_calories_goal),
                  getRecommendation('proteins', stats.bju_ratios.proteins),
                  getRecommendation('fats', stats.bju_ratios.fats),
                  getRecommendation('carbohydrates', stats.bju_ratios.carbohydrates)
                ].map((rec, index) => (
                  <li key={index}>
                    {rec.message}
                  </li>
                ))}
              </ul>

              <h3 className={styles.sectionTitle}>Распределение БЖУ</h3>
              <div className={styles.chart}>
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
              </div>

              <h3 className={styles.sectionTitle}>Нутриенты</h3>
              {stats.nutrients.length > 0 ? (
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
                        <td>{nutrient.amount.toFixed(2)}</td>
                        <td>{nutrient.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Нутриенты не потреблялись за этот день.</p>
              )}
            </>
          ) : (
            <p>Данные за выбранный день отсутствуют.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;