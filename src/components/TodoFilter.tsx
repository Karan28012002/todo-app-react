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
} from '@mui/material';
import { useTodo } from '../context/TodoContext';
import { Priority, Category, TaskStatus, Todo } from '../types/todo';

export default function TodoFilter() {
  const { state, dispatch } = useTodo();
  const { filters, sort } = state;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { search: e.target.value },
    });
  };

  const handlePriorityChange = (e: SelectChangeEvent<Priority | 'all'>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { priority: e.target.value as Priority | 'all' },
    });
  };

  const handleCategoryChange = (e: SelectChangeEvent<Category | 'all'>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { category: e.target.value as Category | 'all' },
    });
  };

  const handleStatusChange = (e: SelectChangeEvent<TaskStatus | 'all'>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { status: e.target.value as TaskStatus | 'all' },
    });
  };

  const handleDueDateChange = (e: SelectChangeEvent<string | null>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { dueDate: e.target.value },
    });
  };

  const handleShowCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { showCompleted: e.target.checked },
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
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Search"
          value={filters.search}
          onChange={handleSearchChange}
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={handlePriorityChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Due Date</InputLabel>
            <Select
              value={filters.dueDate}
              label="Due Date"
              onChange={handleDueDateChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="tomorrow">Tomorrow</MenuItem>
              <MenuItem value="this-week">This Week</MenuItem>
              <MenuItem value="next-week">Next Week</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${sort.field}-${sort.direction}`}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="createdAt-desc">Newest First</MenuItem>
              <MenuItem value="createdAt-asc">Oldest First</MenuItem>
              <MenuItem value="dueDate-asc">Due Date (Asc)</MenuItem>
              <MenuItem value="dueDate-desc">Due Date (Desc)</MenuItem>
              <MenuItem value="priority-desc">Priority (High to Low)</MenuItem>
              <MenuItem value="priority-asc">Priority (Low to High)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showCompleted}
              onChange={handleShowCompletedChange}
            />
          }
          label="Show Completed"
        />
      </Stack>
    </Paper>
  );
} 