import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

export const fetchDailyFood = createAsyncThunk(
  'diet/fetchDailyFood',
  async (date, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      if (!token) {
        console.error('fetchDailyFood: Токен отсутствует');
        return rejectWithValue('Требуется авторизация');
      }
      console.log('fetchDailyFood: Отправка запроса', { url: `/api/foods/daily?date=${date}`, token: token.substring(0, 10) + '...' });
      const response = await axios.get(`/api/foods/daily?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('fetchDailyFood: Ответ получен', response.data);
      return response.data;
    } catch (error) {
      console.error('fetchDailyFood: Ошибка', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: `/api/foods/daily?date=${date}`,
      });
      return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить рацион');
    }
  }
);

export const logFood = createAsyncThunk(
  'diet/logFood',
  async (data, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      console.log('logFood: Отправка запроса', { data });
      const response = await axios.post('/api/foods/log', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('logFood: Ответ получен', response.data);
      return response.data.log;
    } catch (error) {
      console.error('logFood: Ошибка', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Не удалось добавить продукт');
    }
  }
);

export const updateFoodLog = createAsyncThunk(
  'diet/updateFoodLog',
  async (data, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      console.log('updateFoodLog: Отправка запроса', { data });
      const response = await axios.patch('/api/foods/log', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('updateFoodLog: Ответ получен', response.data);
      return { ...data, message: response.data.message };
    } catch (error) {
      console.error('updateFoodLog: Ошибка', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Не удалось обновить запись');
    }
  }
);

export const deleteFoodLog = createAsyncThunk(
  'diet/deleteFoodLog',
  async (logId, { getState, rejectWithValue }) => {
    try {
      const { auth: { token } } = getState();
      console.log('deleteFoodLog: Отправка запроса', { logId });
      const response = await axios.delete('/api/foods/log', {
        headers: { Authorization: `Bearer ${token}` },
        data: { logId },
      });
      console.log('deleteFoodLog: Ответ получен', response.data);
      return logId;
    } catch (error) {
      console.error('deleteFoodLog: Ошибка', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue(error.response?.data?.message || 'Не удалось удалить запись');
    }
  }
);

const dietSlice = createSlice({
  name: 'diet',
  initialState: {
    dailyFood: { breakfast: [], lunch: [], dinner: [], snack: [] },
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyFood.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyFood.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyFood = action.payload || { breakfast: [], lunch: [], dinner: [], snack: [] };
      })
      .addCase(fetchDailyFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logFood.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(logFood.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Продукт добавлен';
        state.dailyFood[action.payload.meal_type].push(action.payload);
      })
      .addCase(logFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFoodLog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateFoodLog.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const { logId, portionSize, mealType } = action.payload;
        for (const type in state.dailyFood) {
          const logIndex = state.dailyFood[type].findIndex((log) => log.id === logId);
          if (logIndex !== -1) {
            const log = state.dailyFood[type][logIndex];
            state.dailyFood[type].splice(logIndex, 1);
            state.dailyFood[mealType].push({
              ...log,
              portion_size: portionSize,
              meal_type: mealType,
            });
            break;
          }
        }
      })
      .addCase(updateFoodLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFoodLog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteFoodLog.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Запись удалена';
        for (const type in state.dailyFood) {
          state.dailyFood[type] = state.dailyFood[type].filter((log) => log.id !== action.payload);
        }
      })
      .addCase(deleteFoodLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = dietSlice.actions;
export default dietSlice.reducer;