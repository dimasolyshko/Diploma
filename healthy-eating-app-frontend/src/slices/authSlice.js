import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../utils/api';

export const register = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/users/register', formData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Ошибка регистрации');
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/users/login', { email, password });
    const { token } = response.data;
    setAuthToken(token);
    localStorage.setItem('token', token);
    return { token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Ошибка входа');
  }
});

export const fetchUserInfo = createAsyncThunk('auth/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки данных пользователя');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (updatedData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/update', updatedData);
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка обновления профиля');
    }
  }
);

export const updatePassword = createAsyncThunk('auth/updatePassword', async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/update-password', { oldPassword, newPassword });
      return response.data.message; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка изменения пароля');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.success = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem('token');
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.success = 'Вход успешен!';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; 
        state.success = 'Профиль успешно обновлён!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload; 
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;