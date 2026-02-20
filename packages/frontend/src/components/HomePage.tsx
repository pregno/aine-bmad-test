import { useState, useCallback } from 'react';
import { Alert, Box, Button, Container, Fab, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddTaskDialog } from './AddTaskDialog';
import { SwipeableTaskCard } from './SwipeableTaskCard';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useCreateTaskMutation } from '../hooks/useCreateTaskMutation';
import { useUpdateTaskStatusMutation } from '../hooks/useUpdateTaskStatusMutation';
import { useDeleteTaskMutation } from '../hooks/useDeleteTaskMutation';
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
  const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);
  const [rollbackFadeTaskId, setRollbackFadeTaskId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const tasks = data?.tasks ?? [];
  const hasTasks = tasks.length > 0;
  const activeTasks = tasks.filter((t) => t.status === TaskStatus.ACTIVE);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);

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

  const handleToggleTask = useCallback(
    (task: Task) => {
      const newStatus =
        task.status === TaskStatus.ACTIVE ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;

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

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTaskMutation.mutate(id, {
        onError: () => {
          setRollbackFadeTaskId(id);
          setDeleteErrorOpen(true);
        },
      });
    },
    [deleteTaskMutation]
  );

  const handleCloseDeleteError = useCallback(() => {
    setDeleteErrorOpen(false);
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
            <Box>
              {activeTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  fadeInOnMount={rollbackFadeTaskId === task.id}
                />
              ))}
            </Box>
          )}

          {!isLoading && completedTasks.length > 0 && (
            <Box sx={{ mt: activeTasks.length > 0 ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Completed ({completedTasks.length})
              </Typography>
              <Box>
                {completedTasks.map((task) => (
                  <SwipeableTaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    fadeInOnMount={rollbackFadeTaskId === task.id}
                  />
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

      <Snackbar
        open={deleteErrorOpen}
        autoHideDuration={6000}
        onClose={handleCloseDeleteError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseDeleteError} severity="error" sx={{ width: '100%' }}>
          Failed to delete task. Try again?
        </Alert>
      </Snackbar>
    </>
  );
}
