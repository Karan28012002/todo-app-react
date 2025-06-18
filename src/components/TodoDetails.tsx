import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  TextField,
  IconButton,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { Todo, SubTask, Comment, Attachment, TimeEntry } from '../types/todo';
import { useTodo } from '../context/TodoContext';
import { format } from 'date-fns';

interface TodoDetailsProps {
  todo: Todo;
  open: boolean;
  onClose: () => void;
}

const TodoDetails: React.FC<TodoDetailsProps> = ({ todo, open, onClose }) => {
  const { dispatch } = useTodo();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState<File | null>(null);
  const [timeEntry, setTimeEntry] = useState({ hours: 0, minutes: 0 });

  const progress = todo.subTasks.length > 0
    ? (todo.subTasks.filter(st => st.completed).length / todo.subTasks.length) * 100
    : todo.completed ? 100 : 0;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      dispatch({
        type: 'ADD_SUBTASK',
        payload: {
          todoId: todo.id,
          subtask: {
            text: newSubtask,
            completed: false,
            updatedAt: new Date().toISOString(),
            completedAt: null,
          },
        },
      });
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    dispatch({
      type: 'UPDATE_SUBTASK',
      payload: {
        todoId: todo.id,
        subtaskId,
        updates: {
          completed: !todo.subTasks.find(st => st.id === subtaskId)?.completed,
        },
      },
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      dispatch({
        type: 'ADD_COMMENT',
        payload: {
          todoId: todo.id,
          comment: {
            text: newComment,
            author: 'Current User',
            updatedAt: new Date().toISOString(),
          },
        },
      });
      setNewComment('');
    }
  };

  const handleAddTimeEntry = () => {
    if (timeEntry.hours > 0 || timeEntry.minutes > 0) {
      dispatch({
        type: 'ADD_TIME_ENTRY',
        payload: {
          todoId: todo.id,
          timeEntry: {
            description: 'Time entry',
            duration: timeEntry.hours * 60 + timeEntry.minutes,
            updatedAt: new Date().toISOString(),
          },
        },
      });
      setTimeEntry({ hours: 0, minutes: 0 });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAttachment(file);
      // Here you would typically upload the file to your storage
      // and then add the attachment to the todo
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{todo.text}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Progress</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Details</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {todo.priority && (
              <Chip
                label={todo.priority}
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
              <Chip label={todo.category} variant="outlined" />
            )}
          </Stack>
          {todo.dueDate && (
            <Typography variant="body2" color="text.secondary">
              Due: {format(new Date(todo.dueDate), 'PPP')}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Subtasks</Typography>
          <List>
            {todo.subTasks.map((subtask) => (
              <ListItem key={subtask.id}>
                <ListItemText
                  primary={subtask.text}
                  sx={{
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleToggleSubtask(subtask.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add subtask"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddSubtask}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Comments</Typography>
          <List>
            {todo.comments.map((comment) => (
              <ListItem key={comment.id}>
                <ListItemText
                  primary={comment.text}
                  secondary={`${comment.author} - ${format(
                    new Date(comment.createdAt),
                    'PPp'
                  )}`}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddComment}
              startIcon={<CommentIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Time Tracking</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              type="number"
              label="Hours"
              value={timeEntry.hours}
              onChange={(e) =>
                setTimeEntry({ ...timeEntry, hours: Number(e.target.value) })
              }
              inputProps={{ min: 0 }}
            />
            <TextField
              size="small"
              type="number"
              label="Minutes"
              value={timeEntry.minutes}
              onChange={(e) =>
                setTimeEntry({ ...timeEntry, minutes: Number(e.target.value) })
              }
              inputProps={{ min: 0, max: 59 }}
            />
            <Button
              variant="contained"
              onClick={handleAddTimeEntry}
              startIcon={<TimerIcon />}
            >
              Add Time
            </Button>
          </Box>
          <List>
            {todo.timeEntries.map((entry) => (
              <ListItem key={entry.id}>
                <ListItemText
                  primary={`${Math.floor(entry.duration / 60)}h ${
                    entry.duration % 60
                  }m`}
                  secondary={format(new Date(entry.createdAt), 'PPp')}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>Attachments</Typography>
          <List>
            {todo.attachments.map((attachment) => (
              <ListItem key={attachment.id}>
                <ListItemText
                  primary={attachment.name}
                  secondary={format(new Date(attachment.createdAt), 'PPp')}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{ mt: 1 }}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDetails; 