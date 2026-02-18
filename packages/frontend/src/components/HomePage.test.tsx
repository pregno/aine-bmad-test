import { describe, expect, it } from 'vitest';
import { act, create, type ReactTestRendererJSON } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { TaskStatus, type GetTasksResponse } from '@aine/shared';
import { HomePage } from './HomePage';

function collectText(node: ReactTestRendererJSON | ReactTestRendererJSON[] | null): string {
  if (!node) return '';
  if (Array.isArray(node)) return node.map((item) => collectText(item)).join(' ');

  const childText = (node.children ?? [])
    .map((child) => (typeof child === 'string' ? child : collectText(child)))
    .join(' ');

  return childText;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

describe('HomePage', () => {
  it('renders static homepage content', () => {
    const renderer = create(<HomePage />);
    const text = normalizeWhitespace(collectText(renderer.toJSON()));

    expect(text).toContain('aine');
    expect(text).toContain('Task management app');
    expect(text).toContain('Increment');
    expect(text).toContain('Count: 0');
  });

  it('increments counter when increment button is clicked', () => {
    const renderer = create(<HomePage />);
    const root = renderer.root;
    const button = root.findByType('button') as ReactTestInstance;

    act(() => {
      const onClick = button.props['onClick'] as (() => void) | undefined;
      onClick?.();
    });

    const counter = root.findByProps({ 'data-testid': 'counter' }) as ReactTestInstance;
    const children = counter.props['children'];
    const text = normalizeWhitespace(
      Array.isArray(children)
        ? children.map((child: unknown) => String(child)).join(' ')
        : String(children)
    );
    expect(text).toContain('Count: 1');
  });

  it('renders seed task count when initialData is provided', () => {
    const initialData: GetTasksResponse = {
      tasks: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          text: 'Seed task',
          status: TaskStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ],
    };

    const renderer = create(<HomePage initialData={initialData} />);
    const text = normalizeWhitespace(collectText(renderer.toJSON()));
    expect(text).toContain('Seed tasks: 1');
  });
});
