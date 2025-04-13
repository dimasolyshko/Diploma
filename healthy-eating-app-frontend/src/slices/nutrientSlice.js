import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNutrients = createAsyncThunk(
  'nutrient/fetchNutrients',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error('Токен отсутствует');
      }
      const response = await axios.get('/api/foods/nutrients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка в fetchNutrients:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки нутриентов');
    }
  }
);

const nutrientSlice = createSlice({
  name: 'nutrient',
  initialState: {
    nutrients: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNutrients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNutrients.fulfilled, (state, action) => {
        state.loading = false;
        state.nutrients = action.payload;
      })
      .addCase(fetchNutrients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default nutrientSlice.reducer;