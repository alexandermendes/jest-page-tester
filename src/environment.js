/* eslint-disable global-require,import/no-unresolved */
import { getConfig } from './config';
import Page from './page';

let JSDOMEnvironment;

try {
  // Use jest-environment-jsdom-sixteen if it exists
  JSDOMEnvironment = require('jest-environment-jsdom-sixteen');
} catch (error) {
  JSDOMEnvironment = require('jest-environment-jsdom');
}

export default class JestPageTesterEnvironment extends JSDOMEnvironment {
  constructor(config, options) {
    const { testURL } = getConfig();

    super({
      ...config,
      testURL,
    }, options);

    this.global.page = new Page(this.dom);
  }

  teardown() {
    this.global.page = null;

    return super.teardown();
  }
}
