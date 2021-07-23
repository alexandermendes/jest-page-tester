import { within } from '@testing-library/dom';

describe('Page', () => {
  it('loads the Google homepage', async () => {
    await page.loadPage('https://google.com');

    const form = within(document).getByRole('form');

    expect(form).not.toBeUndefined();
    expect(form.getAttribute('action')).toBe('/search');
  });

  it('throws if called with a relative URL and no testURL set', async () => {
    await expect(async () => (
      page.loadPage('/page')
    )).rejects.toThrow('A `testURL` must be set');
  });

  it('does not load external scripts by default', async () => {
    await page.loadPage('https://www.radiotimes.com');

    expect(window.googletag).toBeUndefined();
  });

  it('loads external scripts when requested', async () => {
    await page.loadPage('https://www.radiotimes.com');
    await page.loadScripts();

    expect(window.googletag).not.toBeUndefined();
  });
});
