import React, { useState } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TodoProvider } from './context/TodoContext';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import ViewSelector, { ViewType } from './components/ViewSelector';
import { useTheme } from './context/ThemeContext';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('list');
  const { isDarkMode } = useTheme();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

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
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TodoProvider>
          <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ViewSelector currentView={view} onViewChange={setView} />
              </Box>
              <Routes>
                <Route path="/" element={renderView()} />
                <Route path="/kanban" element={<KanbanView />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/list" element={
                  <>
                    <TodoForm />
                    <TodoList />
                  </>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Container>
        </TodoProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
