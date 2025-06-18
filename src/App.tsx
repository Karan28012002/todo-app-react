import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TodoList from './components/TodoList';
import TodoStats from './components/TodoStats';
import ProtectedRoute from './components/auth/ProtectedRoute';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <KanbanView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <TodoStats />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/todos" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
