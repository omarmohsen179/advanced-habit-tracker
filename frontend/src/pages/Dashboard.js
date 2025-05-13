import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchHabits } from '../features/habits/habitsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { habits, loading } = useSelector((state) => state.habits);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const calculateStreak = (habit) => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    const sortedCompletions = [...habit.completions].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    let streak = 1;
    let currentDate = new Date(sortedCompletions[0].date);
    
    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i].date);
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const getCompletionData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const completions = habits.reduce((acc, habit) => {
        const hasCompletion = habit.completions?.some(
          completion => completion.date.startsWith(date)
        );
        return acc + (hasCompletion ? 1 : 0);
      }, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completions,
      };
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Habits
              </Typography>
              <Typography variant="h4">
                {habits.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Streaks
              </Typography>
              <Typography variant="h4">
                {habits.filter(habit => calculateStreak(habit) > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Longest Streak
              </Typography>
              <Typography variant="h4">
                {Math.max(...habits.map(habit => calculateStreak(habit)), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Completion
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCompletionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completions" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Habits */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Habits by Streak
            </Typography>
            <Grid container spacing={2}>
              {[...habits]
                .sort((a, b) => calculateStreak(b) - calculateStreak(a))
                .slice(0, 3)
                .map((habit) => (
                  <Grid item xs={12} md={4} key={habit.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{habit.name}</Typography>
                        <Typography color="textSecondary">
                          Current Streak: {calculateStreak(habit)} days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 