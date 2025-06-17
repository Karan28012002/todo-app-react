import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
  SelectChangeEvent,
  Grid,
  Switch,
} from '@mui/material';
import { useTodo } from '../context/TodoContext';
import { Priority, Category, TodoStatus, Todo } from '../types/todo';

export default function TodoFilter() {
  const { state, dispatch } = useTodo();
  const { filter, sort } = state;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { search: e.target.value },
    });
  };

  const handlePriorityChange = (e: SelectChangeEvent<Priority | 'all'>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { priority: e.target.value as Priority | 'all' },
    });
  };

  const handleCategoryChange = (e: SelectChangeEvent<Category | 'all'>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { category: e.target.value as Category | 'all' },
    });
  };

  const handleStatusChange = (e: SelectChangeEvent<TodoStatus | 'all'>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { status: e.target.value as TodoStatus | 'all' },
    });
  };

  const handleShowArchivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { showArchived: e.target.checked },
    });
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    const [field, direction] = e.target.value.split('-');
    dispatch({
      type: 'SET_SORT',
      payload: {
        field: field as keyof Todo,
        direction: direction as 'asc' | 'desc',
      },
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search"
            value={filter.search}
            onChange={handleSearchChange}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filter.priority}
              label="Priority"
              onChange={handlePriorityChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filter.category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="health">Health</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${sort.field}-${sort.direction}`}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="createdAt-desc">Newest First</MenuItem>
              <MenuItem value="createdAt-asc">Oldest First</MenuItem>
              <MenuItem value="priority-desc">Priority (High to Low)</MenuItem>
              <MenuItem value="priority-asc">Priority (Low to High)</MenuItem>
              <MenuItem value="dueDate-asc">Due Date (Earliest First)</MenuItem>
              <MenuItem value="dueDate-desc">Due Date (Latest First)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            control={
              <Switch
                checked={filter.showArchived}
                onChange={handleShowArchivedChange}
              />
            }
            label="Show Archived"
          />
        </Grid>
      </Grid>
    </Paper>
  );
} 