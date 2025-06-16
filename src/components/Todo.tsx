import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';
import ViewSelector, { ViewType } from './ViewSelector';

const Todo: React.FC = () => {
  const { state, dispatch } = useTodo();
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const [view, setView] = useState<ViewType>('list');

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'list':
      default:
        return (
          <>
            <TodoForm />
            <TodoList />
          </>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Todo App
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ViewSelector currentView={view} onViewChange={handleViewChange} />
            <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {renderView()}
      </Box>
    </Container>
  );
};

export default Todo; 