import { describe, it, expect } from 'vitest';
import { theme } from './muiTheme';

describe('muiTheme', () => {
  it('has primary color #2196F3', () => {
    expect(theme.palette.primary.main).toBe('#2196F3');
  });

  it('uses Roboto font family', () => {
    expect(theme.typography.fontFamily).toContain('Roboto');
  });

  it('sets base font size to 16px for mobile readability', () => {
    expect(theme.typography.fontSize).toBe(16);
  });

  // ATDD Story 4.1 - RED phase: tests below fail until theme extended
  it.skip('[P0] has secondary color as neutral gray for less prominent actions', () => {
    expect(theme.palette.secondary?.main).toBeDefined();
    expect(theme.palette.secondary?.main).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.skip('[P0] uses 8px base spacing unit', () => {
    expect(theme.spacing(1)).toBe(8);
    expect(theme.spacing(2)).toBe(16);
  });

  it.skip('[P1] has 8px border radius for cards and buttons', () => {
    expect(theme.shape.borderRadius).toBe(8);
  });

  it.skip('[P1] has line height 1.5 for comfortable reading', () => {
    const body1 = theme.typography.body1 ?? theme.typography.body2;
    expect(body1?.lineHeight).toBe(1.5);
  });

  it.skip('[P2] defines shape for FAB circular (50% border radius)', () => {
    const components = theme.components as
      | Record<string, { styleOverrides?: Record<string, { borderRadius?: string }> }>
      | undefined;
    const fabRadius = components?.MuiFab?.styleOverrides?.root?.borderRadius;
    expect(fabRadius).toBe('50%');
  });
});
