import nock from 'nock';
import { JSDOM } from 'jsdom';
import { loadPage } from '../../src/page';

nock.disableNetConnect();

nock('http://example.com')
  .persist()
  .get('/with-cookies')
  .reply(200, function respond() {
    return `
      <html>
        <head></head>
        <body>
          ${this.req.headers.cookie.join('')}
        </body>
      </html>
    `;
  }, {
    'content-type': 'text/html',
  });

describe('Cookies', () => {
  it('sends cookies with the request', async () => {
    const jsdom = new JSDOM();

    jsdom.window.document.cookie = 'cookieA=valueA;';
    jsdom.window.document.cookie = 'cookieB=valueB;';

    await loadPage(jsdom, 'http://example.com/with-cookies');

    const actual = jsdom.window.document.body.textContent.replace(/\s/g, '');
    const expected = 'cookieA=valueA;cookieB=valueB';

    expect(actual).toBe(expected);
  });
});
