import { JSDOM } from 'jsdom';
import fetch from './fetch';
import { getConfig } from './config';

/**
 * Get the full URL from a potential relative URL.
 */
const getFullUrl = (url) => {
  const { testURL } = getConfig();
  const absoluteUrlPattern = /^(?:[a-z]+:)?\/\//;

  if (!testURL && !absoluteUrlPattern.test(url)) {
    throw new Error(
      'A `testURL` must be set as a config option or CLI arg if using relative URLs.',
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
 * Load a page into jsdom.
 */
export const loadPage = async (jsdom, url) => {
  const fullUrl = getFullUrl(url);
  const res = await fetch(fullUrl);
  const text = await res.text();

  const dom = new JSDOM(text, { url: fullUrl });

  jsdom.reconfigure({ url: fullUrl });

  jsdom.window.document.head.outerHTML = dom.window.document.head.outerHTML;
  jsdom.window.document.body.outerHTML = dom.window.document.body.outerHTML;
};
