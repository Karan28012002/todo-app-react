import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ViewList as ListIcon,
  ViewKanban as KanbanIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

export type ViewType = 'list' | 'kanban' | 'calendar';

interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      onViewChange(newView);
      navigate(`/${newView === 'list' ? '' : newView}`);
    }
  };

  // Set initial view based on URL
  React.useEffect(() => {
    const path = location.pathname.slice(1); // Remove leading slash
    if (path === 'kanban' || path === 'calendar' || path === '') {
      onViewChange(path === '' ? 'list' : path as ViewType);
    }
  }, [location.pathname, onViewChange]);

  return (
    <ToggleButtonGroup
      value={currentView}
      exclusive
      onChange={handleViewChange}
      aria-label="view selection"
    >
      <ToggleButton value="list" aria-label="list view">
        <ListIcon />
      </ToggleButton>
      <ToggleButton value="kanban" aria-label="kanban view">
        <KanbanIcon />
      </ToggleButton>
      <ToggleButton value="calendar" aria-label="calendar view">
        <CalendarIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewSelector; 