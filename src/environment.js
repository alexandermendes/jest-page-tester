import JSDOMEnvironment from 'jest-environment-jsdom';
import { intercept } from './log';
import { getPageContext } from './page-context';

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
