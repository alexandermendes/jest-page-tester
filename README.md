# Jest Page Tester

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

Load the preset by adding it to your Jest config, as follows:

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jest-page-tester',
}
```

## Usage

Once you have written some tests (see below) you can run them while passing the
`testURL` argument:

```
jest --testURL=https://example.com
```

The following functions will be made available via the `page` global object.

### `page.loadPage()`

Loads a page into the DOM.

```js
it('renders the page title', async () => {
  await page.loadPage('/my/page');

  const title = document.querySelector('h1');

  expect(title).toBe('My Page');
});
```

### `page.loadScripts()`

By default, external script resources will not be loaded. They can be loaded
in a particular test by calling `loadScripts()`, for example:

```js
it('runs the external script', async () => {
  await page.loadPage('/my/page');
  await page.loadScripts();

  // ...
});
```

## Configuration

Jest page tester can be configured by adding a `jest-page-tester.config.js`
file to the root of your repo, or by adding the `jest-page-tester` property
to your `package.json` file, for example:

```js
module.exports = {
  testURL: 'http://example.release.com',
  block: ['www.googletagmanager.com'],
}
```

The available options are documented below.

### `testURL`

The base URL against which to run the tests (will be overwritten by the `--testURL` CLI arg).

### `block`

A list regular expressions matching URLs to block when loading external resources.

## ESLint

Configure ESLint by adding the `page` global, as follows:

```json
{
  "globals": {
    "page": true,
  },
}
```

---

Ideas:

- Debug mode that pauses the test and opens the page in a browser.
- Prefetch hook
