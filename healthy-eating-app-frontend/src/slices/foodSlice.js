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

export const updateFood = createAsyncThunk(
  'food/updateFood',
  async (foodData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error('Токен отсутствует');
      }
      console.log('Отправка updateFood:', { foodData, token });
      const response = await axios.patch('/api/foods/update', foodData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { food: foodData, message: response.data.message };
    } catch (error) {
      console.error('Ошибка в updateFood:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: foodData,
      });
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления продукта');
    }
  }
);

export const deleteFood = createAsyncThunk(
  'food/deleteFood',
  async (foodId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error('Токен отсутствует');
      }
      console.log('Отправка deleteFood:', { foodId, token });
      const response = await axios.delete('/api/foods/delete', {
        headers: { Authorization: `Bearer ${token}` },
        data: { foodId },
      });
      return { foodId, message: response.data.message };
    } catch (error) {
      console.error('Ошибка в deleteFood:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        foodId,
      });
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления продукта');
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
      })
      .addCase(updateFood.pending, (state) => {
        state.loading = true;
        state.formError = null;
        state.success = null;
      })
      .addCase(updateFood.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const updatedFood = action.payload.food;
        state.foods = state.foods.map((food) =>
          food.id === updatedFood.foodId
            ? {
                ...food,
                name: updatedFood.name,
                calories: updatedFood.calories,
                proteins: updatedFood.proteins,
                fats: updatedFood.fats,
                carbohydrates: updatedFood.carbohydrates,
                nutrients: updatedFood.nutrients.map((n) => ({
                  nutrient_id: parseInt(n.nutrient_id),
                  amount: parseFloat(n.amount),
                  name: food.nutrients?.find((nut) => nut.nutrient_id === parseInt(n.nutrient_id))?.name || '',
                  unit: food.nutrients?.find((nut) => nut.nutrient_id === parseInt(n.nutrient_id))?.unit || '',
                })),
              }
            : food
        );
      })
      .addCase(updateFood.rejected, (state, action) => {
        state.loading = false;
        state.formError = action.payload;
      })
      .addCase(deleteFood.pending, (state) => {
        state.loading = true;
        state.formError = null;
        state.success = null;
      })
      .addCase(deleteFood.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.foods = state.foods.filter((food) => food.id !== action.payload.foodId);
      })
      .addCase(deleteFood.rejected, (state, action) => {
        state.loading = false;
        state.formError = action.payload;
      });
  },
});

export const { clearMessages } = foodSlice.actions;
export default foodSlice.reducer;