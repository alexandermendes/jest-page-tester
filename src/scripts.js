import { argv } from 'yargs';
import { Script } from 'vm';
import PQueue from 'p-queue';
import fetch from './fetch';
import { logger } from './log';
import { getConfig } from './config';

const LOADED_ATTRIBUTE = 'data-jest-page-tester-loaded';

/**
 * Fetch a script.
 */
const fetchScript = async (src) => {
  let res;

  try {
    res = await fetch(src);
  } catch (err) {
    logger.error(`Error fetching ${src}, ${err.message}`);

    return null;
  }

  return res.text();
};

/**
 * Get all script elements within the document.
 */
const getScripts = (jsdom) => [...jsdom.window.document.querySelectorAll('script')]
  .filter((el) => {
    const { block = [] } = getConfig();
    const type = el.getAttribute('type');
    const { src } = el;

    // Filter out any non-JS scripts (e.g. application/json).
    if (type && !type.includes('javascript')) {
      return false;
    }

    // Filter out any blocked scripts.
    if (block.some((ptn) => new RegExp(ptn).test(src))) {
      return false;
    }

    // Filter out any inline scripts if not enabled. These will be loaded
    // anyway by jsdom.
    if (!src) {
      return false;
    }

    return true;
  });

/**
 * Get scripts that have not already been loaded.
 */
const getNewScripts = (jsdom) => {
  const allScripts = getScripts(jsdom);
  const newScripts = allScripts.filter((el) => !el.getAttribute(LOADED_ATTRIBUTE));

  return newScripts;
};

/**
 * Run a script in the current VM context.
 */
const loadScript = async (jsdom, scriptEl) => {
  const code = await fetchScript(scriptEl.src);
  const script = new Script(code);
  const vmContext = jsdom.getInternalVMContext();

  try {
    await script.runInContext(vmContext);
  } catch (err) {
    logger.error(`Error running ${scriptEl.src}: ${err.message}`);
  }
};

/**
 * Check if a script element is asynchronous.
 */
const isScriptAsync = (scriptEl) => scriptEl.getAttribute('async') != null;

/**
 * Run synchronous scripts.
 */
const runSyncScripts = (jsdom, scriptEls) => {
  const syncScripts = scriptEls.filter((scriptEl) => !isScriptAsync(scriptEl));
  const queue = new PQueue({ concurrency: 1 });

  return Promise.all(syncScripts.map(async (scriptEl) => (
    queue.add(async () => loadScript(jsdom, scriptEl))
  )));
};

/**
 * Run asynchronous scripts.
 */
const runAsyncScripts = (jsdom, scriptEls) => {
  const asyncScripts = scriptEls.filter(isScriptAsync);

  return Promise.all(asyncScripts.map(async (scriptEl) => loadScript(jsdom, scriptEl)));
};

/**
 * Load scripts.
 *
 * It may be possible to make jsdom do all this with `runScripts: dangerously`
 * and a custom ResourceLoader but I had some problems getting all that to
 * work. Potential refactor oppertunity at some point.
 *
 * Instead we fetch the external scripts and runs those in the current VM context,
 * with some additional functionality for blocking certain scripts etc.
 */
export const loadScripts = async (jsdom) => {
  const scriptsBeforeLoad = getNewScripts(jsdom);

  if (argv.debug) {
    scriptsBeforeLoad
      .filter(({ src }) => src)
      .forEach(({ src }) => {
        logger.debug(`Loading external script: ${src || 'inline'}`);
      });
  }

  await runSyncScripts(jsdom, scriptsBeforeLoad);
  await runAsyncScripts(jsdom, scriptsBeforeLoad);

  scriptsBeforeLoad.forEach((el) => {
    el.setAttribute(LOADED_ATTRIBUTE, true);
  });

  // If the loaded scripts injected more scripts run again to load those.
  if (getNewScripts(jsdom).length) {
    await loadScripts(jsdom);
  }
};
