import nock from 'nock';
import { JSDOM } from 'jsdom';
import { loadPage } from '../../src/page';

nock.disableNetConnect();

nock('http://example.com')
  .persist()
  .defaultReplyHeaders({
    'Content-Type': 'text/html',
  })
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
  })
  .get('/set-one-cookie')
  .reply(200, '', {
    'Set-Cookie': 'responseCookieA=hello',
  })
  .get('/set-two-cookies')
  .reply(200, '', {
    'Set-Cookie': ['responseCookieA=hello', 'responseCookieB=goodbye'],
  });

describe('Cookies', () => {
  afterAll(() => {
    nock.restore();
  });

  it('sends cookies with the request', async () => {
    const jsdom = new JSDOM();

    jsdom.window.document.cookie = 'cookieA=valueA;';
    jsdom.window.document.cookie = 'cookieB=valueB;';

    await loadPage(jsdom, 'http://example.com/with-cookies');

    const actual = jsdom.window.document.body.textContent.replace(/\s/g, '');
    const expected = 'cookieA=valueA;cookieB=valueB';

    expect(actual).toBe(expected);
  });

  it('sets a single cookies from the response', async () => {
    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/set-one-cookie');

    expect(jsdom.window.document.cookie).toBe('responseCookieA=hello');
  });

  it('sets multiple cookies from the response', async () => {
    const jsdom = new JSDOM();

    await loadPage(jsdom, 'http://example.com/set-two-cookies');

    expect(jsdom.window.document.cookie).toBe(
      'responseCookieA=hello; responseCookieB=goodbye',
    );
  });
});
