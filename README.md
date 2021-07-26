# Jest Page Tester

[![npm version](https://badge.fury.io/js/jest-page-tester.svg)](https://badge.fury.io/js/jest-page-tester)

Extends [Jest](https://github.com/facebook/jest) with functionality for loading
real pages into [jsdom](https://github.com/jsdom/jsdom).

Intended for cases where we want to run integration tests against real pages
without dealing with all the implicit flakiness of running those tests in real
browsers.

## Installation

```sh
# npm
npm install jest-page-tester -D

# yarn
yarn add jest-page-tester -D
```

## Setup

Add the `jest-page-tester` preset to your Jest config, as follows:

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jest-page-tester',
}
```

## Usage

The following functions will be made available to your tests via the global `page` object.

### `page.loadPage()`

Load a page into the DOM.

```js
it('renders the page title', async () => {
  await page.loadPage('/my/page');

  const title = document.querySelector('h1');

  expect(title).toBe('My Page');
});
```

### `page.loadScripts()`

Load external scripts (which will not be loaded by default).

```js
it('runs the external script', async () => {
  await page.loadPage('/my/page');
  await page.loadScripts();

  // ...
});
```

## Configuration

Jest page tester can be configured by adding a `jest-page-tester.config.js`
file to the root of your repo, or by adding a `jest-page-tester` property
to your `package.json` file.

The available options are documented below.

### `testURL`

The base URL against which to run the tests (will be overwritten by the `--testURL` CLI arg).

```js
// jest-page-tester.config.js
module.exports = {
  testURL: 'http://example.com',
}
```

### `block`

A list regular expressions used to block the loading of external resources.

```js
// jest-page-tester.config.js
const fetch = require('node-fetch');

module.exports = {
  block: [
    'www.googletagmanager.com',
    'ads.com',
  ],
};
```

### `fetch`

Override the default fetch function used for requesting resources. Useful if
we want to purge an edge cache each time we load a page, for example.

```js
// jest-page-tester.config.js
const fetch = require('node-fetch');

module.exports = {
  fetch: async (url, opts) => {
    await fetch(url, { method: 'PURGE' });

    return fetch(url, opts);
  },
};
```

### `externalLogLevel`

The level of messages to log when evaluating external resources (e.g. scripts).
The default is to log no messages.

```js
// jest-page-tester.config.js
module.exports = {
  externalLogLevel: 'error',
};
```

## ESLint

Configure ESLint by adding the `page` global, as follows:

```json
{
  "globals": {
    "page": "readonly"
  },
}
```
