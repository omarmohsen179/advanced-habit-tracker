import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchHabits } from '../features/habits/habitsSlice';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage = () => {
  const dispatch = useDispatch();
  const { habits, loading } = useSelector((state) => state.habits);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  useEffect(() => {
    const habitEvents = habits.flatMap((habit) =>
      habit.completions?.map((completion) => ({
        id: completion.id,
        title: habit.name,
        start: new Date(completion.date),
        end: new Date(completion.date),
        habitId: habit.id,
        tag: habit.tag,
      })) || []
    );
    setEvents(habitEvents);
  }, [habits]);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#1976d2';
    if (event.tag === 'health') {
      backgroundColor = '#2e7d32';
    } else if (event.tag === 'productivity') {
      backgroundColor = '#ed6c02';
    } else if (event.tag === 'learning') {
      backgroundColor = '#9c27b0';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
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
        Habit Calendar
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Legend
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#1976d2',
                        borderRadius: '4px',
                        display: 'inline-block',
                        mr: 1,
                      }}
                    />
                    <Typography component="span">Default</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#2e7d32',
                        borderRadius: '4px',
                        display: 'inline-block',
                        mr: 1,
                      }}
                    />
                    <Typography component="span">Health</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#ed6c02',
                        borderRadius: '4px',
                        display: 'inline-block',
                        mr: 1,
                      }}
                    />
                    <Typography component="span">Productivity</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: '#9c27b0',
                        borderRadius: '4px',
                        display: 'inline-block',
                        mr: 1,
                      }}
                    />
                    <Typography component="span">Learning</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalendarPage; 