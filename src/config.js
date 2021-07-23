import { cosmiconfigSync } from 'cosmiconfig';
import assert from 'assert';
import { argv } from 'yargs';

const assignCliArgs = (config) => {
  const cliArgs = ['testURL'];

  cliArgs.forEach((key) => {
    const value = argv[key];

    if (value) {
      Object.assign(config, { [key]: value });
    }
  });
};

const validate = (config) => {
  assert.ok(
    config.testURL,
    'A `testURL` is required',
  );

  assert.ok(
    !config.block || Array.isArray(config.block),
    'If the `block` option is given it must be an array.',
  );
};

export const getConfig = () => {
  const explorerSync = cosmiconfigSync('jest-page-tester');
  const config = explorerSync.search() || {};

  assignCliArgs(config);
  validate(config);

  return config;
};
