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
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Todo } from '../types/todo';

interface SortDialogProps {
  open: boolean;
  onClose: () => void;
  sort: {
    field: keyof Todo;
    direction: 'asc' | 'desc';
  };
  onSortChange: (sort: { field: keyof Todo; direction: 'asc' | 'desc' }) => void;
}

const sortOptions = [
  { field: 'createdAt', label: 'Created Date' },
  { field: 'updatedAt', label: 'Last Updated' },
  { field: 'dueDate', label: 'Due Date' },
  { field: 'priority', label: 'Priority' },
  { field: 'text', label: 'Title' },
  { field: 'category', label: 'Category' },
  { field: 'status', label: 'Status' },
] as const;

const SortDialog: React.FC<SortDialogProps> = ({
  open,
  onClose,
  sort,
  onSortChange,
}) => {
  const handleFieldChange = (field: keyof Todo) => {
    onSortChange({ ...sort, field });
  };

  const handleDirectionChange = (direction: 'asc' | 'desc') => {
    onSortChange({ ...sort, direction });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sort Todos</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort.field}
              label="Sort By"
              onChange={(e) => handleFieldChange(e.target.value as keyof Todo)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.field} value={option.field}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <RadioGroup
              value={sort.direction}
              onChange={(e) => handleDirectionChange(e.target.value as 'asc' | 'desc')}
            >
              <FormControlLabel
                value="asc"
                control={<Radio />}
                label="Ascending (A to Z)"
              />
              <FormControlLabel
                value="desc"
                control={<Radio />}
                label="Descending (Z to A)"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onSortChange({
              field: 'createdAt',
              direction: 'desc',
            });
            onClose();
          }}
          color="error"
        >
          Reset
        </Button>
        <Button onClick={onClose} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SortDialog; 