import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
} from '../features/habits/habitsSlice';

const Habits = () => {
  const dispatch = useDispatch();
  const { habits, loading } = useSelector((state) => state.habits);
  const [open, setOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tag: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleOpen = (habit = null) => {
    if (habit) {
      setSelectedHabit(habit);
      setFormData({
        name: habit.name,
        description: habit.description,
        tag: habit.tag,
      });
    } else {
      setSelectedHabit(null);
      setFormData({
        name: '',
        description: '',
        tag: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHabit(null);
    setFormData({
      name: '',
      description: '',
      tag: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedHabit) {
      await dispatch(updateHabit({ id: selectedHabit.id, habitData: formData }));
    } else {
      await dispatch(createHabit(formData));
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await dispatch(deleteHabit(id));
    }
  };

  const handleComplete = async (habitId) => {
    await dispatch(completeHabit({ id: habitId, date: selectedDate.toISOString() }));
  };

  const isHabitCompleted = (habit) => {
    return habit.completions?.some(
      (completion) =>
        new Date(completion.date).toDateString() === selectedDate.toDateString()
    );
  };

  const filteredHabits = filterTag
    ? habits.filter((habit) => habit.tag === filterTag)
    : habits;

  const uniqueTags = [...new Set(habits.map((habit) => habit.tag))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Habits</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Habit
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Tag</InputLabel>
          <Select
            value={filterTag}
            label="Filter by Tag"
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {uniqueTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box mb={3}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </Box>
      </LocalizationProvider>

      <Grid container spacing={3}>
        {filteredHabits.map((habit) => (
          <Grid item xs={12} sm={6} md={4} key={habit.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {habit.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {habit.description}
                </Typography>
                {habit.tag && (
                  <Chip
                    label={habit.tag}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  color={isHabitCompleted(habit) ? 'success' : 'default'}
                  onClick={() => handleComplete(habit.id)}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton onClick={() => handleOpen(habit)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(habit.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedHabit ? 'Edit Habit' : 'Add New Habit'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Tag"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
              margin="normal"
              placeholder="e.g., health, productivity"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedHabit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Habits; 