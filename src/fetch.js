import defaultFetch from 'node-fetch';
import { getConfig } from './config';

/**
 * Fetch a resource, with an optional config-based override.
 */
export default async (...args) => {
  const { fetch = defaultFetch } = getConfig();

  return fetch(...args);
};
