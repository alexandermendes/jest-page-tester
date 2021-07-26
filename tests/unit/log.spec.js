import { JSDOM } from 'jsdom';
import { Script } from 'vm';
import { getConfig } from '../../src/config';
import { intercept } from '../../src/log';

jest.mock('../../src/config');

describe('Log', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({});
  });

  describe('intercept', () => {
    it('does not silence messages by default', () => {
      const mockConsoleLog = jest.fn();
      const jsdom = new JSDOM();

      jsdom.window.console.log = mockConsoleLog;

      intercept(jsdom);

      jsdom.window.console.log('hello');

      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith('hello');
    });

    it('silences messages from the eval machine if the log level not reached', () => {
      const mockConsoleLog = jest.fn();
      const jsdom = new JSDOM('', { runScripts: 'dangerously' });

      jsdom.window.console.log = mockConsoleLog;

      getConfig.mockReturnValue({ externalLogLevel: 'error' });
      intercept(jsdom);

      const script = new Script('console.log("hello")');
      script.runInContext(jsdom.getInternalVMContext());

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('does not silence messages from the eval machine if the log level is reached', () => {
      const mockConsoleLog = jest.fn();
      const jsdom = new JSDOM('', { runScripts: 'dangerously' });

      jsdom.window.console.log = mockConsoleLog;

      getConfig.mockReturnValue({ externalLogLevel: 'log' });
      intercept(jsdom);

      const script = new Script('console.log("hello")');
      script.runInContext(jsdom.getInternalVMContext());

      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith('hello');
    });
  });
});
