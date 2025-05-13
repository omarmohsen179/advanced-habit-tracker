import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import habitsReducer from '../features/habits/habitsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    habits: habitsReducer,
  },
});

export default store; 