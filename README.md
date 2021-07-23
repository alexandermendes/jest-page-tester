# Jest Page Tester

Extends [Jest](https://github.com/facebook/jest) with functionality for loading
real pages into [jsdom](https://github.com/jsdom/jsdom).

Intended for cases where we want to run integration tests against real pages
without dealing with all the implicit flakiness of running those tests in real
browsers.

### Installation

```sh
# npm
npm install jest-page-tester -D

# yarn
yarn add jest-page-tester -D
```

## Setup

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jest-page-tester',
}
```

## Configuring ESLint

```json
// .eslintrc.json
{
  "globals": {
    "page": true,
    "jestPageTester": true,
  },
}
```

## API

### `page.loadPage()`

Loads a page into the DOM.

```js
it('renders the page title', async () => {
  await page.loadPage('/my/page');

  const title = document.querySelector('h1');

  expect(title).toBe('My Page');
});
```

The `loadPage()` function returns an object containing `status`...

```js
it('returns the 404 page', async () => {
  const { status } = await page.loadPage('/my/page');
  const title = document.querySelector('h1');

  expect(status).toBe(404);
  expect(title).toBe('Not Found');
});
```

---

Ideas:

- Debug mode that pauses the test and opens the page in a browser.
- Prefetch hook
