import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/muiTheme';
import { HomePage } from './HomePage';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
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
});
