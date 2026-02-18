import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
});
