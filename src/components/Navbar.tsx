import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Import custom CSS for Navbar

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-brand">
        <Link to="/todos" className="brand-link">
          Todo App
        </Link>
      </div>
      <div className="navbar-collapse">
        <ul className="navbar-nav">
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/todos" className="nav-link">
                  Todos
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/kanban" className="nav-link">
                  Kanban
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/calendar" className="nav-link">
                  Calendar
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/stats" className="nav-link">
                  Statistics
                </Link>
              </li>
              <li className="nav-item welcome-message">
                Welcome, {user?.name}
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 