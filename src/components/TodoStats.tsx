import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TodoStats.css';

interface TodoStatsData {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  statusDistribution: { _id: string; count: number }[];
  priorityDistribution: { _id: string; count: number }[];
  categoryDistribution: { _id: string; count: number }[];
  tagUsage: { _id: string; count: number }[];
  estimatedTotalTime: number;
  actualTotalTime: number;
  completionRate: number;
}

const TodoStats: React.FC = () => {
  const [stats, setStats] = useState<TodoStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/todos/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch statistics');
        }

        const data: TodoStatsData = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="stats-loading-container">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-no-data">
        <p>No statistics available. Start adding some todos!</p>
      </div>
    );
  }

  const renderDistribution = (title: string, data: { _id: string; count: number }[]) => (
    <div className="stat-card-section">
      <h4>{title}</h4>
      {data.length > 0 ? (
        <ul className="stat-list">
          {data.map((item, index) => (
            <li key={index} className="stat-list-item">
              <span className="stat-label">{item._id || 'Uncategorized'}</span>
              <span className="stat-value">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );

  return (
    <div className="todo-stats-container">
      <h2>Todo Statistics</h2>

      <div className="stats-overview-grid">
        <div className="stat-overview-card total">
          <h3>Total Todos</h3>
          <p>{stats.totalTodos}</p>
        </div>
        <div className="stat-overview-card completed">
          <h3>Completed</h3>
          <p>{stats.completedTodos}</p>
        </div>
        <div className="stat-overview-card pending">
          <h3>Pending</h3>
          <p>{stats.pendingTodos}</p>
        </div>
        <div className="stat-overview-card rate">
          <h3>Completion Rate</h3>
          <p>{stats.completionRate != null ? stats.completionRate.toFixed(2) : 'N/A'}%</p>
        </div>
      </div>

      <div className="stats-distribution-grid">
        <div className="stat-card">
          {renderDistribution('Status Distribution', stats.statusDistribution)}
        </div>
        <div className="stat-card">
          {renderDistribution('Priority Distribution', stats.priorityDistribution)}
        </div>
        <div className="stat-card">
          {renderDistribution('Category Distribution', stats.categoryDistribution)}
        </div>
        <div className="stat-card">
          {renderDistribution('Tag Usage', stats.tagUsage)}
        </div>
      </div>

      <div className="stat-card time-tracking">
        <h3>Time Tracking</h3>
        <div className="time-stat-item">
          <span className="stat-label">Total Estimated Time:</span>
          <span className="stat-value">{stats.estimatedTotalTime} hours</span>
        </div>
        <div className="time-stat-item">
          <span className="stat-label">Total Actual Time:</span>
          <span className="stat-value">{stats.actualTotalTime} hours</span>
        </div>
      </div>
    </div>
  );
};

export default TodoStats; 