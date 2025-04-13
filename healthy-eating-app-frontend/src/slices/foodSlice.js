import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

export const addFood = createAsyncThunk(
  'food/addFood',
  async (foodData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error('Токен отсутствует');
      }
      console.log('Отправка addFood:', { foodData, token });
      const response = await axios.post('/api/foods/add', foodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка в addFood:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: foodData,
      });
      return rejectWithValue(error.response?.data?.message || 'Ошибка добавления продукта');
    }
  }
);

export const fetchFoods = createAsyncThunk(
  'food/fetchFoods',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error('Токен отсутствует');
      }
      console.log('Запрос fetchFoods:', { token });
      const response = await axios.get('/api/foods/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка в fetchFoods:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки продуктов');
    }
  }
);

const foodSlice = createSlice({
  name: 'food',
  initialState: {
    foods: [],
    loading: false,
    listError: null,
    formError: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.listError = null;
      state.formError = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFood.pending, (state) => {
        state.loading = true;
        state.formError = null;
        state.success = null;
      })
      .addCase(addFood.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.foods.push(action.payload.food);
      })
      .addCase(addFood.rejected, (state, action) => {
        state.loading = false;
        state.formError = action.payload;
      })
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
        state.listError = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.listError = action.payload;
      });
  },
});

export const { clearMessages } = foodSlice.actions;
export default foodSlice.reducer;