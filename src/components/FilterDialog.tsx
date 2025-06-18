import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  TextField,
} from '@mui/material';
import { Priority, Category, TodoStatus } from '../types/todo';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  filters: {
    status: TodoStatus | 'all';
    priority: Priority | 'all';
    category: Category | 'all';
    search: string;
    showArchived: boolean;
    showStarred: boolean;
    dueDate: string | null;
  };
  onFilterChange: (filters: any) => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  filters,
  onFilterChange,
}) => {
  const handleChange = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Todos</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              label="Priority"
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="health">Health</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Due Date"
            type="date"
            value={filters.dueDate || ''}
            onChange={(e) => handleChange('dueDate', e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={filters.showArchived}
                onChange={(e) => handleChange('showArchived', e.target.checked)}
              />
            }
            label="Show Archived"
          />

          <FormControlLabel
            control={
              <Switch
                checked={filters.showStarred}
                onChange={(e) => handleChange('showStarred', e.target.checked)}
              />
            }
            label="Show Starred Only"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onFilterChange({
              status: 'all',
              priority: 'all',
              category: 'all',
              search: '',
              showArchived: false,
              showStarred: false,
              dueDate: null,
            });
            onClose();
          }}
          color="error"
        >
          Clear Filters
        </Button>
        <Button onClick={onClose} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog; 