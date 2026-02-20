import { useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Snackbar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AddTaskDialog } from './AddTaskDialog';
import { SwipeableTaskCard } from './SwipeableTaskCard';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useCreateTaskMutation } from '../hooks/useCreateTaskMutation';
import { useUpdateTaskStatusMutation } from '../hooks/useUpdateTaskStatusMutation';
import { useDeleteTaskMutation } from '../hooks/useDeleteTaskMutation';
import { useClearCompletedTasksMutation } from '../hooks/useClearCompletedTasksMutation';
import { TaskStatus } from '@aine/shared';
import type { Task } from '@aine/shared';

const COMPLETED_EXPANDED_KEY = 'aine-completed-expanded';

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
  const [clearCompletedDialogOpen, setClearCompletedDialogOpen] = useState(false);
  const [clearCompletedErrorOpen, setClearCompletedErrorOpen] = useState(false);
  const [clearCompletedSuccessOpen, setClearCompletedSuccessOpen] = useState(false);
  const [clearCompletedSuccessMessage, setClearCompletedSuccessMessage] = useState('');
  const [rollbackFadeTaskIds, setRollbackFadeTaskIds] = useState<Set<string>>(new Set());
  const [isCompletedExpanded, setIsCompletedExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COMPLETED_EXPANDED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const { data, isLoading, isError, refetch } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const clearCompletedMutation = useClearCompletedTasksMutation();
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

  const handleToggleCompleted = useCallback(() => {
    setIsCompletedExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPLETED_EXPANDED_KEY, String(next));
      } catch {
        // localStorage unavailable — state still updates in memory
      }
      return next;
    });
  }, []);

  const handleClearCompletedClick = useCallback(() => {
    setClearCompletedDialogOpen(true);
  }, []);

  const handleClearCompletedCancel = useCallback(() => {
    setClearCompletedDialogOpen(false);
  }, []);

  const handleClearCompletedConfirm = useCallback(() => {
    const ids = new Set(completedTasks.map((t) => t.id));
    setRollbackFadeTaskIds(new Set());
    setClearCompletedDialogOpen(false);
    clearCompletedMutation.mutate(
      { completedTaskIds: Array.from(ids) },
      {
        onSuccess: (data) => {
          const n = data.deletedCount;
          setRollbackFadeTaskIds(new Set());
          setClearCompletedSuccessMessage(n === 1 ? '1 task cleared' : `${n} tasks cleared`);
          setClearCompletedSuccessOpen(true);
        },
        onError: () => {
          setRollbackFadeTaskIds(ids);
          setClearCompletedErrorOpen(true);
        },
      }
    );
  }, [completedTasks, clearCompletedMutation]);

  const handleCloseClearCompletedError = useCallback(() => {
    setClearCompletedErrorOpen(false);
    setRollbackFadeTaskIds(new Set());
  }, []);

  const handleCloseClearCompletedSuccess = useCallback(() => {
    setClearCompletedSuccessOpen(false);
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
              <Box
                component="button"
                type="button"
                onClick={handleToggleCompleted}
                aria-expanded={isCompletedExpanded}
                data-testid="completed-section-toggle"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  p: 0,
                  mb: 1,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Completed ({completedTasks.length})
                </Typography>
                {isCompletedExpanded ? (
                  <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                )}
              </Box>
              <Collapse in={isCompletedExpanded} timeout={300} unmountOnExit>
                <Box>
                  <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={handleClearCompletedClick}
                    data-testid="clear-completed-button"
                    sx={{ mb: 1 }}
                  >
                    Clear All Completed
                  </Button>
                  {completedTasks.map((task) => (
                    <SwipeableTaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      fadeInOnMount={
                        rollbackFadeTaskId === task.id || rollbackFadeTaskIds.has(task.id)
                      }
                    />
                  ))}
                </Box>
              </Collapse>
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

      <Dialog
        open={clearCompletedDialogOpen}
        onClose={handleClearCompletedCancel}
        aria-labelledby="clear-completed-dialog-title"
        aria-describedby="clear-completed-dialog-description"
      >
        <DialogTitle id="clear-completed-dialog-title">
          Delete all {completedTasks.length} completed tasks? This cannot be undone.
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-completed-dialog-description">
            All completed tasks will be permanently removed from your list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearCompletedCancel} data-testid="clear-completed-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleClearCompletedConfirm}
            color="primary"
            variant="contained"
            data-testid="clear-completed-confirm"
            autoFocus
          >
            Clear Completed
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={clearCompletedSuccessOpen}
        autoHideDuration={3000}
        onClose={handleCloseClearCompletedSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseClearCompletedSuccess} severity="success" sx={{ width: '100%' }}>
          {clearCompletedSuccessMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={clearCompletedErrorOpen}
        autoHideDuration={6000}
        onClose={handleCloseClearCompletedError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseClearCompletedError} severity="error" sx={{ width: '100%' }}>
          Failed to clear completed tasks. Try again?
        </Alert>
      </Snackbar>
    </>
  );
}
