import { cosmiconfigSync } from 'cosmiconfig';
import assert from 'assert';
import { argv } from 'yargs';

/**
 * Check if a URL is valid.
 */
const isValidUrl = (url) => {
  try {
    return !!new URL(url);
  } catch (err) {
    return false;
  }
};

/**
 * Assign any CLI args to the config object.
 */
const assignCliArgs = (config) => {
  const cliArgs = ['testURL'];

  cliArgs.forEach((key) => {
    const value = argv[key];

    if (value) {
      Object.assign(config, { [key]: value });
    }
  });
};

/**
 * Validate the config.
 */
const validate = (config) => {
  assert.ok(
    !config.testURL || isValidUrl(config.testURL),
    `The \`testURL\` must be a valid URL, got ${config.testURL}`,
  );

  assert.ok(
    !config.block || Array.isArray(config.block),
    'If the `block` option is given it must be an array.',
  );

  assert.ok(
    !config.fetch || typeof config.fetch === 'function',
    'If the `fetch` option is given it must be a function.',
  );
};

/**
 * Get the jest-page-tester config.
 */
export const getConfig = () => {
  const explorerSync = cosmiconfigSync('jest-page-tester');
  const config = explorerSync.search() || {};

  assignCliArgs(config);
  validate(config);

  return config;
};
