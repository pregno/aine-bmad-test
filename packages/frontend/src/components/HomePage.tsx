import { useState, useCallback } from 'react';
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
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { AddTaskDialog } from './AddTaskDialog';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useCreateTaskMutation } from '../hooks/useCreateTaskMutation';

export function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createErrorOpen, setCreateErrorOpen] = useState(false);
  const [retryText, setRetryText] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const tasks = data?.tasks ?? [];
  const hasTasks = tasks.length > 0;

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

          {!isLoading && hasTasks && (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {tasks.map((task) => (
                <Box component="li" key={task.id} sx={{ mb: 1 }} data-taskid={task.id}>
                  <Card sx={{ minHeight: 48 }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="body1">{task.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(task.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
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
    </>
  );
}
