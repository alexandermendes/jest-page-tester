import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { loadScripts } from './scripts';
import { getConfig } from './config';

const CURRENT_URL_ATTRIBUTE = 'data-jest-page-tester-url';

/**
 * Get the full URL from a potential relative URL.
 */
const getFullUrl = (url) => {
  const { testURL } = getConfig();
  let href;

  try {
    ({ href } = new URL(url));
  } catch (err) {
    ({ href } = new URL(url, testURL));
  }

  return href;
};

/**
 * Purge a URL from the edge cache then fetch.
 *
 * TODO: Make fastly purge an option.
 */
const purgedFetch = async (url, options = {}) => {
  const fullUrl = getFullUrl(url);
  await fetch(fullUrl, { method: 'PURGE' });

  return fetch(fullUrl, options);
};

/**
 * Copy attributes from one DOM element to another.
 */
const copyAttributes = (sourceEl, targetEl) => {
  [...sourceEl.attributes].forEach((attr) => {
    targetEl.setAttribute(attr.nodeName, attr.nodeValue);
  });
};

/**
 * Get the current URL from the body element of the page.
 */
export const getCurrentUrl = () => global.document.body.getAttribute(CURRENT_URL_ATTRIBUTE);

export default class Page {
  constructor(jsdom) {
    this.jsdom = jsdom;
    this.currentUrl = null;
    this.status = null;
  }

  async loadPage(url, options) {
    const fullUrl = getFullUrl(url);

    this.currentUrl = fullUrl;

    const res = await purgedFetch(url, options);
    const text = await res.text();

    const dom = new JSDOM(text, { url: fullUrl });

    this.jsdom.reconfigure({ url: fullUrl });

    this.jsdom.window.document.head.innerHTML = dom.window.document.head.innerHTML;
    this.jsdom.window.document.body.innerHTML = dom.window.document.body.innerHTML;

    copyAttributes(dom.window.document.body, this.jsdom.window.document.body);
  }

  async loadScripts() {
    await loadScripts(this.jsdom);
  }
}
