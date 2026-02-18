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
});
