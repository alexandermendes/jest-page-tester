import { JSDOM } from 'jsdom';
import fetch from '../../src/fetch';
import { getConfig } from '../../src/config';
import { loadPage } from '../../src/page';

jest.mock('../../src/fetch');
jest.mock('../../src/config');

describe('Page', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({});
    fetch.mockReturnValue({ text: () => '' });
  });

  it('reconfigures the current URL from an absolute URL', async () => {
    const jsdom = new JSDOM();
    jsdom.reconfigure = jest.fn();

    await loadPage(jsdom, 'http://example.com/page');

    expect(jsdom.reconfigure).toHaveBeenCalledTimes(1);
    expect(jsdom.reconfigure).toHaveBeenCalledWith({
      url: 'http://example.com/page',
    });
  });

  it('reconfigures the current URL from a relative URL', async () => {
    const jsdom = new JSDOM();
    jsdom.reconfigure = jest.fn();
    getConfig.mockReturnValue({ testURL: 'http://example.com' });

    await loadPage(jsdom, '/page');

    expect(jsdom.reconfigure).toHaveBeenCalledTimes(1);
    expect(jsdom.reconfigure).toHaveBeenCalledWith({
      url: 'http://example.com/page',
    });
  });

  it('throws if loading a relative URL and no testURL', async () => {
    const jsdom = new JSDOM();

    await expect(async () => loadPage(jsdom, '/page')).rejects.toThrow(
      'A `testURL` must be set',
    );
  });

  it('copies the contents of the head', async () => {
    fetch.mockReturnValueOnce({
      text: () => '<html><head><script>console.log("hello");</script></head></html>',
    });

    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/page');

    expect(jsdom.window.document.head.innerHTML).toBe(
      '<script>console.log("hello");</script>',
    );
  });

  it('copies the contents of the body', async () => {
    fetch.mockReturnValueOnce({
      text: () => '<html><body>Hello</body></html>',
    });

    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/page');

    expect(jsdom.window.document.body.innerHTML).toBe('Hello');
  });

  it('copies any body attributes', async () => {
    const html = '<body data-foo="bar">Hello</body>';

    fetch.mockReturnValueOnce({
      text: () => '<html><body data-foo="bar">Hello</body></html>',
    });

    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/page');

    expect(jsdom.window.document.body.outerHTML).toBe(html);
  });

  it('copies any html attributes', async () => {
    const html = '<html data-foo="bar"><head></head><body>Hello</body></html>';

    fetch.mockReturnValueOnce({
      text: () => html,
    });

    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/page');

    expect(jsdom.window.document.documentElement.outerHTML).toBe(html);
  });
});
