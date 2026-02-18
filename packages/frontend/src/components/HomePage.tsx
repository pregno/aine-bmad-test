import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@aine/shared';
import { Box, Button, Card, CardContent, Container, Fab, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchTasks } from '../api/tasks';
import { formatRelativeTime } from '../utils/formatRelativeTime';

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data.tasks);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <>
      <Container maxWidth="sm" sx={{ pb: 10 }}>
        <Box sx={{ py: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            aine — Task Manager
          </Typography>

          {loading && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Loading...
            </Typography>
          )}

          {error && !loading && (
            <Box sx={{ py: 2 }}>
              <Typography color="error" gutterBottom>
                Failed to load tasks
              </Typography>
              <Button variant="contained" onClick={loadTasks} data-testid="retry-button">
                Retry
              </Button>
            </Box>
          )}

          {!loading && !error && tasks.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No tasks yet. Tap + to get started.
            </Typography>
          )}

          {!loading && !error && tasks.length > 0 && (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {tasks.map((task) => (
                <Box component="li" key={task.id} sx={{ mb: 1 }}>
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
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
}
