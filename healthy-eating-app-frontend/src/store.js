import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import foodReducer from './slices/foodSlice';
import nutrientReducer from './slices/nutrientSlice';
import dietReducer from "./slices/dietSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, 
    food: foodReducer,
    nutrient: nutrientReducer,
    diet: dietReducer,
  },
});

export default store;