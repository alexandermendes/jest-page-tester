import { cosmiconfigSync } from 'cosmiconfig';
import { getConfig } from '../../src/config';

jest.mock('cosmiconfig');

const originalArgv = process.argv;

process.argv = [...originalArgv.slice(0, 2), 'testURL=foo'];

describe('Config', () => {
  beforeEach(() => {
    jest.resetModules();

    cosmiconfigSync.mockReturnValue({
      search: () => ({}),
    });
  });

  it('loads the config', () => {
    cosmiconfigSync.mockReturnValue({
      search: () => ({
        testURL: 'http://example.com',
      }),
    });

    const config = getConfig();

    expect(cosmiconfigSync).toHaveBeenCalledTimes(1);
    expect(cosmiconfigSync).toHaveBeenCalledWith('jest-page-tester');
    expect(config).toEqual({
      testURL: 'http://example.com',
    });
  });

  it.each([
    'testURL',
    'fetch',
    'block',
  ])('throws if %s is invalid', (key) => {
    cosmiconfigSync.mockReturnValue({
      search: () => ({
        [key]: 'no good',
      }),
    });

    expect(() => getConfig()).toThrow(`Invalid \`${key}\` setting`);
  });
});
