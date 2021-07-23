import { loadScripts } from './scripts';
import { loadPage } from './page';

/**
 * Get a new page context.
 */
export const getPageContext = (jsdom) => ({
  loadPage: (url) => loadPage(jsdom, url),
  loadScripts: () => loadScripts(jsdom),
});
