import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodo } from '../context/TodoContext';
import { TaskStatus } from '../types/todo';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const KanbanView: React.FC = () => {
  const theme = useTheme();
  const { state, dispatch } = useTodo();
  const { todos } = state;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);
      
      dispatch({
        type: 'REORDER_TODOS',
        payload: {
          oldIndex,
          newIndex,
        },
      });
    }
  };

  const handleToggleStar = (id: string) => {
    dispatch({
      type: 'TOGGLE_STAR',
      payload: id,
    });
  };

  const handleToggleArchive = (id: string) => {
    dispatch({
      type: 'TOGGLE_ARCHIVE',
      payload: id,
    });
  };

  const handleDelete = (id: string) => {
    dispatch({
      type: 'DELETE_TODO',
      payload: id,
    });
  };

  const columns: { [key in TaskStatus]: string } = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
  };

  return (
    <Box sx={{ p: 2 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            height: 'calc(100vh - 200px)',
          }}
        >
          {Object.entries(columns).map(([status, title]) => (
            <Paper
              key={status}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.background.paper,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.divider,
                    borderRadius: '4px',
                  },
                }}
              >
                <SortableContext
                  items={todos
                    .filter((todo) => todo.status === status)
                    .map((todo) => todo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {todos
                    .filter((todo) => todo.status === status)
                    .map((todo) => (
                      <SortableItem key={todo.id} id={todo.id}>
                        <Paper
                          sx={{
                            p: 2,
                            mb: 1,
                            cursor: 'grab',
                            '&:active': {
                              cursor: 'grabbing',
                            },
                            bgcolor: theme.palette.background.paper,
                            '&:hover': {
                              bgcolor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed
                                  ? theme.palette.text.disabled
                                  : theme.palette.text.primary,
                              }}
                            >
                              {todo.text}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStar(todo.id)}
                              >
                                {todo.isStarred ? (
                                  <StarIcon color="warning" />
                                ) : (
                                  <StarBorderIcon />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleArchive(todo.id)}
                              >
                                {todo.isArchived ? (
                                  <UnarchiveIcon />
                                ) : (
                                  <ArchiveIcon />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(todo.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {todo.priority && (
                              <Chip
                                label={todo.priority}
                                size="small"
                                color={
                                  todo.priority === 'high'
                                    ? 'error'
                                    : todo.priority === 'medium'
                                    ? 'warning'
                                    : 'success'
                                }
                              />
                            )}
                            {todo.category && (
                              <Chip
                                label={todo.category}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Paper>
                      </SortableItem>
                    ))}
                </SortableContext>
              </Box>
            </Paper>
          ))}
        </Box>
      </DndContext>
    </Box>
  );
};

export default KanbanView; 