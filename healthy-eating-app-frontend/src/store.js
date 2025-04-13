import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import nutrientReducer from './slices/nutrientSlice'

const store = configureStore({
  reducer: {
    auth: authReducer, 
    food: foodReducer,
    nutrient: nutrientReducer,
  },
});

export default store;