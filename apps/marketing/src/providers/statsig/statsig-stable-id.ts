/**
 * This script enables subdomain tracking for Statsig by managing a stable ID.
 * The original script can be found at https://docs.statsig.com/guides/sidecar-experiments/advanced-configurations#persisting-stableid-across-subdomains
 * The modifications to this file include:
 * 1. Fixes a bug related to port numbers in the domain when setting cookies.
 * 2. Uses 'statsig_stable_id' as the cookie name instead of the default 'statsiguuid'.
 */

const LOCAL_STORAGE_KEY = 'STATSIG_LOCAL_STORAGE_STABLE_ID';
const COOKIE_NAME = 'statsig_stable_id';
const URL_PARAM_NAME = 'statsig_stable_id';
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateUUID(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const hex = () =>
    Math.floor(65536 * Math.random())
      .toString(16)
      .padStart(4, '0');

  return `${hex()}${hex()}-${hex()}-4${hex().substring(1)}-${hex()}-${hex()}${hex()}${hex()}`;
}

function setCookie(value: string) {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 12);

  const hostParts = window.location.host.split('.');
  if (hostParts.length > 2) {
    hostParts.shift();
  }
  // Strip port number from the last part of the domain
  hostParts[hostParts.length - 1] = hostParts[hostParts.length - 1].split(':')[0];

  const domain = `.${hostParts.join('.')}`;
  document.cookie = `${COOKIE_NAME}=${value || generateUUID()};Expires=${expires};Domain=${domain};Path=/`;
}

function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

function getStableIdFromUrlParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(URL_PARAM_NAME);
}

function removeStableIdFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM_NAME);
  window.history.replaceState(window.history.state, '', url.toString());
}

function getStableIdFromCookie(): string | null {
  const match = document.cookie.match(/statsig_stable_id=([\w-]+);?/);
  return match ? match[1] : null;
}

(function () {
  // URL parameter takes highest precedence — override everything if valid
  const urlParamId = getStableIdFromUrlParam();
  if (urlParamId && isValidUUID(urlParamId)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, urlParamId);
    setCookie(urlParamId);
    removeStableIdFromUrl();
    return;
  }

  const localStorageId = localStorage.getItem(LOCAL_STORAGE_KEY) || null;
  const cookieId = getStableIdFromCookie();

  if (cookieId && localStorageId && cookieId === localStorageId) {
    // Already in sync, nothing to do
    return;
  }

  if (cookieId && localStorageId && cookieId !== localStorageId) {
    // Cookie takes precedence over localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, cookieId);
  } else if (cookieId && !localStorageId) {
    // Cookie exists but localStorage doesn't — sync localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, cookieId);
  } else {
    // No cookie — generate a new ID and set both
    const newId = generateUUID();
    localStorage.setItem(LOCAL_STORAGE_KEY, newId);
    setCookie(newId);
  }
})();
