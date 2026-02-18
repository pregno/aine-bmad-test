import { Children, ReactElement, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('defines root and about routes', () => {
    const root = App();
    expect(isValidElement(root)).toBe(true);

    const rootElement = root as ReactElement<{ children: ReactElement }>;
    const suspenseChildren = Children.toArray(rootElement.props.children);
    const routesElement = suspenseChildren.find(
      (child) => isValidElement(child) && child.type === Routes
    ) as { props: { children: unknown } } | undefined;

    expect(routesElement).toBeDefined();

    const routeElements = Children.toArray(
      (routesElement as ReactElement<{ children: ReactElement }>).props.children
    ).filter((child) => isValidElement(child) && child.type === Route) as Array<{
      props: { path?: string };
    }>;

    const paths = routeElements.map((route) => route.props.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/about');
  });
});
