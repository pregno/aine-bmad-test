import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { theme } from '../theme/muiTheme';
import { HomePage } from './HomePage';
import { TASKS_REFETCH_INTERVAL_MS } from '../hooks/useTasksQuery';
import { TASKS_QUERY_KEY } from '../lib/queryClient';

function renderWithTheme(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('HomePage', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
    onlineManager.setOnline(true);
    vi.useRealTimers();
  });

  it('renders title and shows loading initially', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    );

    renderWithTheme(<HomePage />);

    expect(screen.getByRole('heading', { name: /aine — Task Manager/i })).toBeInTheDocument();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('shows empty state when API returns no tasks (AC2)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Tap + to get started.')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /add task/i }).length).toBeGreaterThan(0);
  });

  it('shows task list when API returns tasks (AC3)', async () => {
    const tasks = [
      {
        id: '1',
        text: 'Review PR',
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks }),
      })
    );

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Review PR')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /add task/i }).length).toBeGreaterThan(0);
  });

  it('shows 3 task cards in newest-first order when API returns 3 tasks (AC3)', async () => {
    const baseTime = new Date('2026-02-18T12:00:00Z').getTime();
    // API returns newest-first (per Story 2.2)
    const tasks = [
      {
        id: '3',
        text: 'Newest task',
        status: 'ACTIVE' as const,
        createdAt: new Date(baseTime).toISOString(),
        completedAt: null,
      },
      {
        id: '2',
        text: 'Middle task',
        status: 'ACTIVE' as const,
        createdAt: new Date(baseTime - 86400000).toISOString(),
        completedAt: null,
      },
      {
        id: '1',
        text: 'Oldest task',
        status: 'ACTIVE' as const,
        createdAt: new Date(baseTime - 86400000 * 2).toISOString(),
        completedAt: null,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks }),
      })
    );

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Newest task')).toBeInTheDocument();
    });

    const taskList = screen.getByText('Newest task').closest('ul');
    expect(taskList).toBeInTheDocument();
    const cards = taskList!.querySelectorAll(':scope > li');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('Newest task');
    expect(cards[1]).toHaveTextContent('Middle task');
    expect(cards[2]).toHaveTextContent('Oldest task');
  });

  it('shows error and Retry when API fails (AC4)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });

    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /add task/i }).length).toBeGreaterThan(0);
  });

  it('refetches when Retry is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tasks: [
              {
                id: '1',
                text: 'Recovered',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                completedAt: null,
              },
            ],
          }),
      });

    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });

    const retryButtons = screen.getAllByTestId('retry-button');
    await userEvent.click(retryButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText('Recovered')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  const waitForEmptyState = async () => {
    await waitFor(() => {
      const emptyMsg = screen.getAllByText('No tasks yet. Tap + to get started.');
      expect(emptyMsg.length).toBeGreaterThan(0);
    });
  };

  it('FAB click opens dialog with TextField and buttons (AC1)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByRole('textbox', { name: /what needs to be done/i })).toBeInTheDocument();
    expect(screen.getByTestId('add-task-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('add-task-submit')).toBeInTheDocument();
  });

  it('Add Task with valid text creates task and closes dialog (AC2)', async () => {
    const taskText = 'Review Sarah PR';
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              task: {
                id: 'real-id',
                text: taskText,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                completedAt: null,
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, taskText);
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await waitFor(() => {
      expect(screen.getAllByText(taskText).length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Enter key submits like Add Task button (AC3)', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              task: {
                id: 'real-id',
                text: 'Enter task',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                completedAt: null,
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Enter task{Enter}');

    await waitFor(() => {
      expect(screen.getAllByText('Enter task').length).toBeGreaterThan(0);
    });
  });

  it('failed create rolls back and Retry re-attempts successfully (AC3)', async () => {
    const taskText = 'Retry create task';
    let postAttempts = 0;
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        postAttempts += 1;
        if (postAttempts <= 6) {
          return Promise.resolve({ ok: false, status: 500 });
        }

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              task: {
                id: 'real-id-retry',
                text: taskText,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                completedAt: null,
              },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, taskText);
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await waitFor(
      () => {
        expect(screen.getByText('Failed to create task. Try again?')).toBeInTheDocument();
      },
      { timeout: 15_000 }
    );
    expect(screen.queryByText(taskText)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(screen.getByText(taskText)).toBeInTheDocument();
    });
    expect(postAttempts).toBeGreaterThanOrEqual(7);
  });

  it('rapid creates keep newest-first order with out-of-order concurrent responses (AC4)', async () => {
    const postDeferred = [deferred<Response>(), deferred<Response>(), deferred<Response>()];
    let postIndex = 0;

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        const current = postDeferred[postIndex]!;
        postIndex += 1;
        return current.promise;
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      } as Response);
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    for (const text of ['Task One', 'Task Two', 'Task Three']) {
      await userEvent.click(screen.getByRole('button', { name: /add task/i }));
      const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
      await userEvent.type(input, text);
      await userEvent.click(screen.getByTestId('add-task-submit'));
    }

    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.getByText('Task Two')).toBeInTheDocument();
      expect(screen.getByText('Task Three')).toBeInTheDocument();
    });
    expect(postIndex).toBe(3);

    // Resolve out of order to verify replacement logic remains stable.
    postDeferred[2]!.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          task: {
            id: 'real-3',
            text: 'Task Three',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
        }),
    } as Response);
    postDeferred[0]!.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          task: {
            id: 'real-1',
            text: 'Task One',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
        }),
    } as Response);
    postDeferred[1]!.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          task: {
            id: 'real-2',
            text: 'Task Two',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
        }),
    } as Response);

    const taskList = screen.getByText('Task Three').closest('ul');
    expect(taskList).toBeInTheDocument();
    const cards = taskList!.querySelectorAll(':scope > li');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('Task Three');
    expect(cards[1]).toHaveTextContent('Task Two');
    expect(cards[2]).toHaveTextContent('Task One');
  });

  it('failed concurrent create only rolls back its own optimistic task', async () => {
    const postDeferred = [deferred<Response>(), deferred<Response>()];
    let postCallCount = 0;

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        postCallCount += 1;
        if (postCallCount === 1) {
          return postDeferred[0]!.promise;
        }
        if (postCallCount === 2) {
          return postDeferred[1]!.promise;
        }
        return Promise.resolve({ ok: false, status: 500 } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      } as Response);
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    let input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Task A');
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Task B');
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await waitFor(() => {
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
    });

    postDeferred[1]!.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          task: {
            id: 'real-b',
            text: 'Task B',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
        }),
    } as Response);
    postDeferred[0]!.resolve({ ok: false, status: 500 } as Response);

    await waitFor(
      () => {
        expect(screen.queryByText('Task A')).not.toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      },
      { timeout: 15_000 }
    );
  });

  it('shows optimistic task even if initial load failed', async () => {
    const taskText = 'Visible despite initial error';
    let getAttempt = 0;

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              task: {
                id: 'real-visible',
                text: taskText,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                completedAt: null,
              },
            }),
        } as Response);
      }

      getAttempt += 1;
      if (getAttempt === 1) {
        return Promise.resolve({ ok: false, status: 500 } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      } as Response);
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, taskText);
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await waitFor(() => {
      expect(screen.getByText(taskText)).toBeInTheDocument();
      expect(screen.queryByText('Failed to load tasks')).not.toBeInTheDocument();
    });
  });

  it('refresh reads persisted server data via GET /tasks (AC5)', async () => {
    const persisted: Array<{
      id: string;
      text: string;
      status: 'ACTIVE';
      createdAt: string;
      completedAt: null;
    }> = [];

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        const newTask = {
          id: 'persisted-id',
          text: 'Persisted task',
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        persisted.unshift(newTask);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ task: newTask }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: persisted }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    const firstRender = renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Persisted task');
    await userEvent.click(screen.getByTestId('add-task-submit'));

    await waitFor(() => {
      expect(screen.getByText('Persisted task')).toBeInTheDocument();
    });

    firstRender.unmount();
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Persisted task')).toBeInTheDocument();
    });
  });

  it('empty text shows validation error, dialog stays open (AC4)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    await userEvent.click(screen.getByTestId('add-task-submit'));

    expect(screen.getByText('Task text is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /what needs to be done/i })).toBeInTheDocument();
  });

  it('Cancel closes without creating (AC5)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Should not appear');
    await userEvent.click(screen.getByTestId('add-task-cancel'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });

  it('Escape closes without creating (AC5)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const input = await screen.findByRole('textbox', { name: /what needs to be done/i });
    await userEvent.type(input, 'Escape should discard');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Escape should discard')).not.toBeInTheDocument();
  });

  it('TASKS_REFETCH_INTERVAL_MS is 30 seconds (AC2)', () => {
    expect(TASKS_REFETCH_INTERVAL_MS).toBe(30_000);
  });

  it('refetches automatically on polling interval for cross-device sync (AC2)', async () => {
    vi.useFakeTimers();

    let getCallCount = 0;
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        getCallCount += 1;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);

    // Flush initial React effects and the initial fetch promise.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(getCallCount).toBe(1);

    // Advance by the full polling interval to trigger the refetch.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(TASKS_REFETCH_INTERVAL_MS);
    });

    expect(getCallCount).toBeGreaterThanOrEqual(2);
  });

  it('refetches when network reconnects for cross-device sync (AC3)', async () => {
    let getCallCount = 0;
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        getCallCount += 1;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Tap + to get started.')).toBeInTheDocument();
    });

    expect(getCallCount).toBe(1);

    // Simulate going offline then reconnecting — TanStack Query triggers refetch on reconnect.
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);

    await waitFor(() => {
      expect(getCallCount).toBeGreaterThanOrEqual(2);
    });
  });

  it('task data from server has all required fields for cross-device parity (AC4)', async () => {
    const createdAt = '2026-02-18T10:00:00.000Z';
    const taskFixture = {
      id: 'parity-id',
      text: 'Parity task',
      status: 'ACTIVE' as const,
      createdAt,
      completedAt: null as null,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [taskFixture] }),
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <HomePage />
        </ThemeProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Parity task')).toBeInTheDocument();
    });

    const cached = queryClient.getQueryData<{ tasks: (typeof taskFixture)[] }>(TASKS_QUERY_KEY);
    expect(cached?.tasks[0]).toMatchObject({
      id: 'parity-id',
      text: 'Parity task',
      status: 'ACTIVE',
      createdAt,
      completedAt: null,
    });
  });

  it('500+ chars shows validation error and character count (AC6)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks: [] }),
      })
    );

    renderWithTheme(<HomePage />);
    await waitForEmptyState();

    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByRole('textbox', { name: /what needs to be done/i });
    const longText = 'a'.repeat(523);
    fireEvent.change(input, { target: { value: longText } });
    await waitFor(() => expect(input).toHaveValue(longText));
    await userEvent.click(within(dialog).getByTestId('add-task-submit'));

    await waitFor(
      () => {
        expect(
          within(dialog).getByText(/Task text must be 500 characters or less/)
        ).toBeInTheDocument();
        expect(within(dialog).getByText(/523\/500/)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  // ─── Story 3.4: Complete Task with Animation and Optimistic UI ────────────

  it('tapping active task card calls PATCH and moves task to completed section (AC1, AC2)', async () => {
    const activeTask = {
      id: 'task-1',
      text: 'Write report',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    const completedTask = {
      ...activeTask,
      status: 'COMPLETED' as const,
      completedAt: new Date().toISOString(),
    };

    const patchDeferred = deferred<Response>();
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return patchDeferred.promise;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [activeTask] }),
      } as Response);
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Write report')).toBeInTheDocument();
    });

    // Task should be in active list initially (no strikethrough)
    expect(screen.queryByText('Completed (1)')).not.toBeInTheDocument();

    // Click the task text to complete it (bubbles up to Card onClick)
    await userEvent.click(screen.getByText('Write report'));

    // Optimistic update: task moves to completed section
    await waitFor(() => {
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });

    // PATCH was called with COMPLETED status and UI moved before server response resolved.
    const patchCall = fetchMock.mock.calls.find(
      ([, init]: [string, RequestInit?]) => init?.method === 'PATCH'
    );
    expect(patchCall).toBeDefined();
    expect(JSON.parse(patchCall![1]!.body as string)).toEqual({ status: 'COMPLETED' });

    patchDeferred.resolve({
      ok: true,
      json: () => Promise.resolve({ task: completedTask }),
    } as Response);
  });

  it('tapping completed task card calls PATCH with ACTIVE and moves task back (AC5)', async () => {
    const completedTask = {
      id: 'task-2',
      text: 'Done task',
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    const activeTask = {
      ...completedTask,
      status: 'ACTIVE' as const,
      completedAt: null,
    };

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ task: activeTask }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [completedTask] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });

    // Click the completed task text to un-complete it (bubbles up to Card onClick)
    await userEvent.click(screen.getByText('Done task'));

    // Optimistic update: task moves back to active section, completed section disappears
    await waitFor(() => {
      expect(screen.queryByText('Completed (1)')).not.toBeInTheDocument();
    });

    const patchCall = fetchMock.mock.calls.find(
      ([, init]: [string, RequestInit?]) => init?.method === 'PATCH'
    );
    expect(patchCall).toBeDefined();
    expect(JSON.parse(patchCall![1]!.body as string)).toEqual({ status: 'ACTIVE' });
  });

  it('server response updates task completedAt with server-provided timestamp (AC3)', async () => {
    const activeTask = {
      id: 'task-3',
      text: 'Server timestamp task',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    const serverCompletedAt = '2026-02-18T15:00:00.000Z';
    const serverTask = {
      ...activeTask,
      status: 'COMPLETED' as const,
      completedAt: serverCompletedAt,
    };

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ task: serverTask }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [activeTask] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <HomePage />
        </ThemeProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Server timestamp task')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Server timestamp task'));

    // After server responds, cache has server-provided completedAt
    await waitFor(() => {
      const cached = queryClient.getQueryData<{ tasks: (typeof serverTask)[] }>(TASKS_QUERY_KEY);
      const task = cached?.tasks.find((t) => t.id === 'task-3');
      expect(task?.completedAt).toBe(serverCompletedAt);
      expect(task?.status).toBe('COMPLETED');
    });
  });

  it('PATCH failure rolls back optimistic update and shows error toast (AC4)', async () => {
    const activeTask = {
      id: 'task-4',
      text: 'Failing task',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [activeTask] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Failing task')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Failing task'));

    // Toast appears
    await waitFor(() => {
      expect(screen.getByText('Failed to complete task. Try again?')).toBeInTheDocument();
    });

    // Task is rolled back to active section (no completed section)
    expect(screen.queryByText('Completed (1)')).not.toBeInTheDocument();
  });

  it('un-complete failure shows the correct action-specific toast message', async () => {
    const completedTask = {
      id: 'task-err-2',
      text: 'Completed but fails to un-complete',
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [completedTask] }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Completed but fails to un-complete')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Completed but fails to un-complete'));

    await waitFor(() => {
      expect(screen.getByText('Failed to un-complete task. Try again?')).toBeInTheDocument();
    });
  });

  it('completed section header shows count and is only visible when completedTasks > 0', async () => {
    const tasks = [
      {
        id: 'a1',
        text: 'Active task',
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      {
        id: 'c1',
        text: 'Completed task',
        status: 'COMPLETED' as const,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks }),
      })
    );

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Active task')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
  });

  it('completed tasks have strikethrough style applied', async () => {
    const tasks = [
      {
        id: 'c2',
        text: 'Struck through task',
        status: 'COMPLETED' as const,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tasks }),
      })
    );

    renderWithTheme(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Struck through task')).toBeInTheDocument();
    });

    const taskText = screen.getByText('Struck through task');
    expect(taskText).toHaveStyle({ textDecoration: 'line-through' });
  });
});
