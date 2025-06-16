import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  PriorityHigh as PriorityHighIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { Priority, Category, Todo, RecurrenceType } from '../types/todo';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TodoForm: React.FC = () => {
  const { dispatch } = useTodo();
  const [newTodo, setNewTodo] = useState({
    text: '',
    completed: false,
    priority: 'medium' as Priority,
    category: 'personal' as Category,
    tags: [] as string[],
    dueDate: null as string | null,
    progress: 0,
    subTasks: [],
    dependencies: [],
    comments: [],
    attachments: [],
    timeEntries: [],
    estimatedTime: undefined as number | undefined,
    actualTime: undefined as number | undefined,
    recurrence: undefined as { type: RecurrenceType; interval: number; endDate: string | null; } | undefined,
    customFields: {},
    assignedTo: '',
    status: 'todo' as const,
    notificationSettings: {
      email: false,
      push: false,
      reminderTime: null,
    },
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.text.trim()) return;

    dispatch({
      type: 'ADD_TODO',
      payload: {
        ...newTodo,
        isStarred: false,
        isArchived: false,
      } as Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>,
    });

    setNewTodo({
      text: '',
      completed: false,
      priority: 'medium',
      category: 'personal',
      tags: [],
      dueDate: null,
      progress: 0,
      subTasks: [],
      dependencies: [],
      comments: [],
      attachments: [],
      timeEntries: [],
      estimatedTime: undefined,
      actualTime: undefined,
      recurrence: undefined,
      customFields: {},
      assignedTo: '',
      status: 'todo',
      notificationSettings: {
        email: false,
        push: false,
        reminderTime: null,
      },
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (newTodo.tags.includes(newTag.trim())) return;

    setNewTodo({
      ...newTodo,
      tags: [...newTodo.tags, newTag.trim()],
    });
    setNewTag('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setNewTodo({
      ...newTodo,
      tags: newTodo.tags.filter(tag => tag !== tagToDelete),
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            value={newTodo.text}
            onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
            placeholder="What needs to be done?"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AddIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTodo.priority}
                label="Priority"
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Priority })}
                startAdornment={
                  <InputAdornment position="start">
                    <PriorityHighIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTodo.category}
                label="Category"
                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value as Category })}
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={newTodo.dueDate ? new Date(newTodo.dueDate) : null}
                onChange={(date) => setNewTodo({ ...newTodo, dueDate: date ? date.toISOString() : null })}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 150 },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tags"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LabelIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add Tag
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {newTodo.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                size="small"
              />
            ))}
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={!newTodo.text.trim()}
            startIcon={<AddIcon />}
          >
            Add Todo
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default TodoForm; 