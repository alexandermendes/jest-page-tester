import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { loadScripts } from './scripts';
import { getConfig } from './config';

/**
 * Get the full URL from a potential relative URL.
 */
const getFullUrl = (url) => {
  const { testURL } = getConfig();
  const absoluteUrlPattern = /^(?:[a-z]+:)?\/\//;

  if (!testURL && !absoluteUrlPattern.test(url)) {
    throw new Error(
      'A `testURL` must be set as a config option or CLI arg if using relative URLs.'
    );
  }

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
const purgedFetch = async (url) => {
  const fullUrl = getFullUrl(url);
  await fetch(fullUrl, { method: 'PURGE' });

  return fetch(fullUrl);
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
 * Load a page into jsdom.
 */
export const loadPage = async (jsdom, url) => {
  const fullUrl = getFullUrl(url);
  const res = await purgedFetch(url);
  const text = await res.text();

  const dom = new JSDOM(text, { url: fullUrl });

  jsdom.reconfigure({ url: fullUrl });

  jsdom.window.document.head.innerHTML = dom.window.document.head.innerHTML;
  jsdom.window.document.body.innerHTML = dom.window.document.body.innerHTML;

  copyAttributes(dom.window.document.body, jsdom.window.document.body);
}
