/* eslint-disable import/no-unresolved,global-require */
import { intercept } from './log';
import { getPageContext } from './page-context';

let JSDOMEnvironment;

try {
  // Use jest-environment-jsdom-sixteen if it exists
  JSDOMEnvironment = require('jest-environment-jsdom-sixteen');
} catch (error) {
  JSDOMEnvironment = require('jest-environment-jsdom');
}

export default class JestPageTesterEnvironment extends JSDOMEnvironment {
  constructor(config, options) {
    super(config, options);

    this.global.page = getPageContext(this.dom);
  }

  setup() {
    intercept(this.dom);

    return super.setup();
  }

  teardown() {
    this.global.page = null;
    this.dom.window.close();

    return super.teardown();
  }
}
