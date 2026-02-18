/**
 * Production app base URL.
 * Used for all auth redirects and external navigation to the app.
 */
export const APP_BASE_URL = "https://app.creatorcorev3.com";

/**
 * Redirect the browser to the production app.
 * @param path Optional path to append (e.g. "/dashboard"). Defaults to "/".
 */
export function redirectToApp(path = "/") {
  window.location.href = `${APP_BASE_URL}${path}`;
}

/**
 * Build a full app URL for use in email links, OAuth redirects, etc.
 */
export function appUrl(path = "/") {
  return `${APP_BASE_URL}${path}`;
}
