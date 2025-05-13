import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for CRUD operations
export const fetchHabits = createAsyncThunk('habits/fetchHabits', async (_, thunkAPI) => {
  try {
    const response = await api.get('habits/');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const createHabit = createAsyncThunk('habits/createHabit', async (habitData, thunkAPI) => {
  try {
    const response = await api.post('habits/', habitData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const updateHabit = createAsyncThunk('habits/updateHabit', async ({ id, habitData }, thunkAPI) => {
  try {
    const response = await api.put(`habits/${id}/`, habitData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const deleteHabit = createAsyncThunk('habits/deleteHabit', async (id, thunkAPI) => {
  try {
    await api.delete(`habits/${id}/`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const completeHabit = createAsyncThunk('habits/completeHabit', async ({ id, date }, thunkAPI) => {
  try {
    const response = await api.post(`habits/${id}/complete/`, { date });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

const habitsSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    loading: false,
    error: null,
    selectedHabit: null,
  },
  reducers: {
    setSelectedHabit: (state, action) => {
      state.selectedHabit = action.payload;
    },
    clearSelectedHabit: (state) => {
      state.selectedHabit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch habits
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create habit
      .addCase(createHabit.fulfilled, (state, action) => {
        state.habits.push(action.payload);
      })
      // Update habit
      .addCase(updateHabit.fulfilled, (state, action) => {
        const index = state.habits.findIndex(habit => habit.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      // Delete habit
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.habits = state.habits.filter(habit => habit.id !== action.payload);
      })
      // Complete habit
      .addCase(completeHabit.fulfilled, (state, action) => {
        const habit = state.habits.find(h => h.id === action.payload.habit_id);
        if (habit) {
          if (!habit.completions) {
            habit.completions = [];
          }
          habit.completions.push(action.payload);
        }
      });
  },
});

export const { setSelectedHabit, clearSelectedHabit } = habitsSlice.actions;
export default habitsSlice.reducer; 