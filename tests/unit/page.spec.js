import nock from 'nock';
import { JSDOM } from 'jsdom';
import { getConfig } from '../../src/config';
import { loadPage } from '../../src/page';

jest.mock('../../src/config');

const basicPageHtml = `
  <html
    data-example="html"
  >
    <head
      data-example="head"
    >
      <script>console.log("hello");</script>
    </head>
    <body
      data-example="body"
    >
      Hello
    </body>
  </html>
`;

nock('http://example.com')
  .persist()
  .get('/page')
  .reply(200, basicPageHtml, {
    'content-type': 'text/html',
  });

describe('Page', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({});
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

  it('copies all key HTML elements', async () => {
    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/page');

    const actual = jsdom.window.document.documentElement.outerHTML.replace(/\s/g, '');
    const expected = basicPageHtml.replace(/\s/g, '');

    expect(actual).toBe(expected);
  });
});
