import fetch from 'node-fetch';
import { argv } from 'yargs';
import { Script } from 'vm';
import { logger } from './log';

const LOADED_ATTRIBUTE = 'data-jest-page-tester-loaded';

/**
 * Fetch a script.
 */
const fetchScript = async (src) => {
  let res;

  try {
    res = await fetch(src);
  } catch (err) {
    process.stderr.write(`Error fetching ${src}, ${err.message}`);

    return null;
  }

  return res.text();
};

/**
 * Get the source of a script.
 */
const loadScriptSrc = async (scriptEl) => {
  const { src } = scriptEl;
  let code;

  if (src) {
    code = await fetchScript(src);
  }

  return code || scriptEl.innerHTML;
};

/**
 * Get all script elements within the document.
 */
const getScripts = (jsdom, {
  block = [],
  inline = true,
}) => [...jsdom.window.document.querySelectorAll('script')]
  .filter((el) => {
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

    // Filter out any inline scripts if not enabled.
    if (!src && !inline) {
      return false;
    }

    return true;
  });

/**
 * Get scripts that have not already been loaded.
 */
const getNewScripts = (jsdom, scriptOpts) => {
  const allScripts = getScripts(jsdom, scriptOpts);
  const newScripts = allScripts.filter((el) => !el.getAttribute(LOADED_ATTRIBUTE));

  return newScripts;
};

/**
 * Run a script in the current VM context.
 */
const loadScript = async (jsdom, scriptEl) => {
  const code = await loadScriptSrc(scriptEl);
  const script = new Script(code);
  const vmContext = jsdom.getInternalVMContext();

  script.runInContext(vmContext);
};

/**
 * Load scripts.
 *
 * It may be possible to make jsdom do all this with `runScripts: dangerously`,
 * but I had some problems getting that to run scripts injected by other.
 * Instead this fetches the source for inline or external scripts and runs that
 * source in the current VM context, with some additional functionality for
 * blocking certain scripts etc.
 */
export const loadScripts = async (jsdom, scriptOpts) => {
  const scriptsBeforeLoad = getNewScripts(jsdom, scriptOpts);

  if (argv.debug) {
    scriptsBeforeLoad
      .filter(({ src }) => src)
      .forEach(({ src }) => {
        logger.debug(`Loading external script: ${src || 'inline'}`);
      });
  }

  await Promise.all(scriptsBeforeLoad.map((scriptEl) => loadScript(jsdom, scriptEl)));

  scriptsBeforeLoad.forEach((el) => {
    el.setAttribute(LOADED_ATTRIBUTE, true);
  });

  const scriptsAfterLoad = getNewScripts(jsdom, scriptOpts);

  // If the loaded scripts injected more scripts run again to load those.
  if (scriptsBeforeLoad.length > scriptsAfterLoad.length) {
    await loadScripts(jsdom, scriptOpts);
  }
};
