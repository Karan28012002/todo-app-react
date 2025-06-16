import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

const CalendarView: React.FC = () => {
  const { state, dispatch } = useTodo();
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTodosForDate = (date: Date) => {
    return state.todos.filter(todo => 
      todo.dueDate && isSameDay(new Date(todo.dueDate), date)
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const todos = getTodosForDate(date);
    if (todos.length > 0) {
      setSelectedTodo(todos[0].id);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Box>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Typography
              key={day}
              variant="subtitle2"
              sx={{ textAlign: 'center', fontWeight: 'bold' }}
            >
              {day}
            </Typography>
          ))}
          {days.map(day => {
            const todos = getTodosForDate(day);
            return (
              <Box
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                sx={{
                  p: 1,
                  minHeight: 100,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: isToday(day)
                    ? theme.palette.action.hover
                    : 'transparent',
                  opacity: isSameMonth(day, currentDate) ? 1 : 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday(day) ? 'bold' : 'normal',
                    color: isToday(day)
                      ? theme.palette.primary.main
                      : 'inherit',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {todos.map(todo => (
                    <Chip
                      key={todo.id}
                      label={todo.text}
                      size="small"
                      color={
                        todo.priority === 'high'
                          ? 'error'
                          : todo.priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      sx={{ mb: 0.5, width: '100%', justifyContent: 'flex-start' }}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Dialog
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDate && (
          <>
            <DialogTitle>
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
            <DialogContent>
              {getTodosForDate(selectedDate).map(todo => (
                <Box
                  key={todo.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{todo.text}</Typography>
                    <Box>
                      <Tooltip title={todo.isStarred ? 'Unstar' : 'Star'}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch({
                              type: 'TOGGLE_STAR',
                              payload: todo.id,
                            })
                          }
                        >
                          {todo.isStarred ? (
                            <StarIcon sx={{ color: theme.palette.warning.main }} />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={todo.isArchived ? 'Unarchive' : 'Archive'}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch({
                              type: 'TOGGLE_ARCHIVE',
                              payload: todo.id,
                            })
                          }
                        >
                          {todo.isArchived ? <RestoreIcon /> : <ArchiveIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label={todo.priority}
                      color={
                        todo.priority === 'high'
                          ? 'error'
                          : todo.priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    />
                    <Chip size="small" label={todo.category} color="primary" />
                    {todo.tags.map(tag => (
                      <Chip
                        key={tag}
                        size="small"
                        label={tag}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedDate(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarView; 