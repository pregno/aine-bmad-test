import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders about heading', () => {
    const html = renderToStaticMarkup(<AboutPage />);
    expect(html).toContain('About aine');
  });
});
