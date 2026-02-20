import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fab,
  Snackbar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { AddTaskDialog } from './AddTaskDialog';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useCreateTaskMutation } from '../hooks/useCreateTaskMutation';
import { useUpdateTaskStatusMutation } from '../hooks/useUpdateTaskStatusMutation';
import { TaskStatus } from '@aine/shared';
import type { Task } from '@aine/shared';

export function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createErrorOpen, setCreateErrorOpen] = useState(false);
  const [retryText, setRetryText] = useState<string | null>(null);
  const [toggleErrorOpen, setToggleErrorOpen] = useState(false);
  const [toggleErrorMessage, setToggleErrorMessage] = useState(
    'Failed to complete task. Try again?'
  );
  const [animatedTaskId, setAnimatedTaskId] = useState<string | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'to-completed' | 'to-active' | null>(
    null
  );
  const animationTimeoutRef = useRef<number | null>(null);
  const { data, isLoading, isError, refetch } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const tasks = data?.tasks ?? [];
  const hasTasks = tasks.length > 0;
  const activeTasks = tasks.filter((t) => t.status === 'ACTIVE');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  const handleCreateError = useCallback((text: string) => {
    setRetryText(text);
    setCreateErrorOpen(true);
  }, []);

  const handleAddTask = useCallback(
    (text: string) => {
      setDialogOpen(false);
      setCreateErrorOpen(false);
      setRetryText(null);
      createTaskMutation.mutate(text, {
        onError: () => {
          handleCreateError(text);
        },
      });
    },
    [createTaskMutation, handleCreateError]
  );

  const handleRetryCreate = useCallback(() => {
    if (!retryText) {
      return;
    }

    setCreateErrorOpen(false);
    createTaskMutation.mutate(retryText, {
      onError: () => {
        handleCreateError(retryText);
      },
      onSuccess: () => {
        setRetryText(null);
        setCreateErrorOpen(false);
      },
    });
  }, [createTaskMutation, handleCreateError, retryText]);

  const handleCloseCreateError = useCallback(() => {
    setCreateErrorOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleTask = useCallback(
    (task: Task) => {
      const newStatus =
        task.status === TaskStatus.ACTIVE ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;
      const nextDirection = newStatus === TaskStatus.COMPLETED ? 'to-completed' : 'to-active';

      setAnimatedTaskId(task.id);
      setAnimationDirection(nextDirection);
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        setAnimatedTaskId(null);
        setAnimationDirection(null);
      }, 350);

      updateTaskStatusMutation.mutate(
        { id: task.id, status: newStatus },
        {
          onError: () => {
            setToggleErrorMessage(
              newStatus === TaskStatus.COMPLETED
                ? 'Failed to complete task. Try again?'
                : 'Failed to un-complete task. Try again?'
            );
            setToggleErrorOpen(true);
          },
        }
      );
    },
    [updateTaskStatusMutation]
  );

  const handleCloseToggleError = useCallback(() => {
    setToggleErrorOpen(false);
  }, []);

  return (
    <>
      <Container maxWidth="sm" sx={{ pb: 10 }}>
        <Box sx={{ py: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            aine — Task Manager
          </Typography>

          {isLoading && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Loading...
            </Typography>
          )}

          {isError && !isLoading && !hasTasks && (
            <Box sx={{ py: 2 }}>
              <Typography color="error" gutterBottom>
                Failed to load tasks
              </Typography>
              <Button variant="contained" onClick={() => void refetch()} data-testid="retry-button">
                Retry
              </Button>
            </Box>
          )}

          {isError && !isLoading && hasTasks && (
            <Box sx={{ py: 1 }}>
              <Typography color="error" variant="body2" gutterBottom>
                Failed to refresh tasks
              </Typography>
              <Button variant="text" onClick={() => void refetch()} data-testid="retry-button">
                Retry
              </Button>
            </Box>
          )}

          {!isLoading && !isError && !hasTasks && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No tasks yet. Tap + to get started.
            </Typography>
          )}

          {!isLoading && activeTasks.length > 0 && (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {activeTasks.map((task) => (
                <Box component="li" key={task.id} sx={{ mb: 1 }} data-taskid={task.id}>
                  <Card
                    onClick={() => handleToggleTask(task)}
                    sx={{
                      minHeight: 48,
                      cursor: 'pointer',
                      transition: 'opacity 300ms ease, transform 300ms ease',
                      transform:
                        animatedTaskId === task.id && animationDirection === 'to-active'
                          ? 'translateY(-4px)'
                          : 'translateY(0)',
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 1.5,
                        '&:last-child': { pb: 1.5 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1">{task.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(task.createdAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}

          {!isLoading && completedTasks.length > 0 && (
            <Box sx={{ mt: activeTasks.length > 0 ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Completed ({completedTasks.length})
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {completedTasks.map((task) => (
                  <Box component="li" key={task.id} sx={{ mb: 1 }} data-taskid={task.id}>
                    <Card
                      onClick={() => handleToggleTask(task)}
                      sx={{
                        minHeight: 48,
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 300ms ease, transform 300ms ease',
                        transform:
                          animatedTaskId === task.id && animationDirection === 'to-completed'
                            ? 'translateY(4px)'
                            : 'translateY(0)',
                      }}
                    >
                      <CardContent
                        sx={{
                          py: 1.5,
                          '&:last-child': { pb: 1.5 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            color: 'success.main',
                            fontSize: 20,
                            flexShrink: 0,
                            transform:
                              animatedTaskId === task.id && animationDirection === 'to-completed'
                                ? 'scale(1)'
                                : 'scale(0.9)',
                            opacity:
                              animatedTaskId === task.id && animationDirection === 'to-completed'
                                ? 1
                                : 0.9,
                            transition: 'transform 150ms ease, opacity 150ms ease',
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              transition: 'all 300ms ease',
                            }}
                          >
                            {task.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(task.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      <Fab
        color="primary"
        aria-label="add task"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      <AddTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddTask}
      />

      <Snackbar
        open={createErrorOpen}
        autoHideDuration={6000}
        onClose={handleCloseCreateError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseCreateError}
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetryCreate}>
              Retry
            </Button>
          }
          sx={{ width: '100%' }}
        >
          Failed to create task. Try again?
        </Alert>
      </Snackbar>

      <Snackbar
        open={toggleErrorOpen}
        autoHideDuration={6000}
        onClose={handleCloseToggleError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToggleError} severity="error" sx={{ width: '100%' }}>
          {toggleErrorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
