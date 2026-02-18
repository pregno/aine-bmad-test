import { useState } from 'react';
import type { GetTasksResponse } from '@aine/shared';
import { Box, Button, Container, Typography } from '@mui/material';

interface HomePageProps {
  /** Placeholder for future API data (Story 2.5) */
  initialData?: GetTasksResponse;
}

export function HomePage({ initialData }: HomePageProps = {}) {
  const [count, setCount] = useState(0);

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          aine — Task Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Task management app — implementation coming in Story 2.3.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button variant="contained" onClick={() => setCount((value) => value + 1)}>
            Increment
          </Button>
          <Typography data-testid="counter" variant="body2">
            Count: {count}
          </Typography>
        </Box>
        {initialData ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Seed tasks: {initialData.tasks.length}
          </Typography>
        ) : null}
      </Box>
    </Container>
  );
}
