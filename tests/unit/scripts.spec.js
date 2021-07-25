import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { getConfig } from '../../src/config';
import { loadScripts } from '../../src/scripts';
import { logger } from '../../src/log';

jest.mock('node-fetch');
jest.mock('p-queue');
jest.mock('../../src/config');

const originalError = logger.error;

describe('Scripts', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({});
    fetch.mockReturnValue({ text: () => '' });

    PQueue.mockImplementation(() => ({
      add: async (cb) => cb(),
    }));
  });

  afterEach(() => {
    logger.error = originalError;
  });

  it.each([
    'application/javascript',
    'text/javascript',
  ])('fetches external scripts with type="%s"', async (type) => {
    const jsdom = new JSDOM(`
      <script src="http://example.com/script.js" type="${type}"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://example.com/script.js');
  });

  it('fetches external scripts with no type attribute', async () => {
    const jsdom = new JSDOM(`
      <script src="http://example.com/script.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://example.com/script.js');
  });

  it('does not fetch blocked scripts', async () => {
    const jsdom = new JSDOM(`
      <script src="http://example.com/script.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    getConfig.mockReturnValue({
      block: ['example.com'],
    });

    await loadScripts(jsdom);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not attempt to fetch inline scripts', async () => {
    const jsdom = new JSDOM('<script></script>', {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not attempt to fetch scripts with a non-JS type', async () => {
    const jsdom = new JSDOM(`
      <script src="/bad" type="application/json"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads scripts injected by other scripts', async () => {
    fetch.mockReturnValueOnce({
      text: () => `
        const newScript = document.createElement('script');

        newScript.src = 'http://injected.com/script.js';

        window.document.head.appendChild(newScript);
      `,
    });

    fetch.mockReturnValueOnce({
      text: () => '',
    });

    const jsdom = new JSDOM(`
      <script src="http://original.com/script.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith('http://original.com/script.js');
    expect(fetch).toHaveBeenCalledWith('http://injected.com/script.js');
  });

  it('loads sync scripts in a queue', async () => {
    const mockAdd = jest.fn(async (cb) => cb());

    PQueue.mockImplementation(() => ({
      add: mockAdd,
    }));

    const jsdom = new JSDOM(`
      <script src="http://example.com/1.js"></script>
      <script src="http://example.com/2.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(PQueue).toHaveBeenCalledTimes(1);
    expect(PQueue).toHaveBeenCalledWith({ concurrency: 1 });
    expect(mockAdd).toHaveBeenCalledTimes(2);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe('http://example.com/1.js');
    expect(fetch.mock.calls[1][0]).toBe('http://example.com/2.js');
  });

  it('does not load async scripts in a queue', async () => {
    const mockAdd = jest.fn(async (cb) => cb());

    PQueue.mockImplementation(() => ({
      add: mockAdd,
    }));

    const jsdom = new JSDOM(`
      <script async="" src="http://example.com/script.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(mockAdd).not.toHaveBeenCalled();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('http://example.com/script.js');
  });

  it('loads sync before async scripts', async () => {
    const jsdom = new JSDOM(`
      <script async src="http://example.com/1.js"></script>
      <script src="http://example.com/2.js"></script>
    `, {
      runScripts: 'dangerously',
    });

    await loadScripts(jsdom);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe('http://example.com/2.js');
    expect(fetch.mock.calls[1][0]).toBe('http://example.com/1.js');
  });

  describe('errors', () => {
    it('logs errors when running scripts', async () => {
      logger.error = jest.fn();

      fetch.mockReturnValueOnce({
        text: () => `
          throw new Error('bad thing');
        `,
      });

      const jsdom = new JSDOM(`
        <script src="http://example.com/script.js"></script>
      `, {
        runScripts: 'dangerously',
      });

      await loadScripts(jsdom);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'Error running http://example.com/script.js: bad thing',
      );
    });

    it('logs errors when running aync scripts', async () => {
      logger.error = jest.fn();

      fetch.mockReturnValueOnce({
        text: () => `
          (async () => {
            throw new Error('bad thing');
          })();
        `,
      });

      const jsdom = new JSDOM(`
        <script src="http://example.com/script.js"></script>
      `, {
        runScripts: 'dangerously',
      });

      await loadScripts(jsdom);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'Error running http://example.com/script.js: bad thing',
      );
    });
  });
});
