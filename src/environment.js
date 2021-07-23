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
    super(config, options);

    this.global.page = new Page(this.dom);
  }

  teardown() {
    this.global.page = null;

    return super.teardown();
  }
}
