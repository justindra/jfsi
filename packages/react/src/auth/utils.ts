import InApp from 'detect-inapp';

/**
 * Generate the sign in url for the given provider
 * @param provider The provider to sign in with, e.g. Google, GitHub, etc.
 * @param authUrl The auth backend url
 * @param redirectUrl The redirect url
 * @param clientId The client id
 * @returns
 */
export function generateSignInUrl(
  provider: string,
  authUrl: string,
  redirectUrl: string,
  clientId: string = 'local'
) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUrl,
    response_type: 'code',
    provider,
  });

  return `${authUrl}?${params.toString()}`;
}

export const inApp = new InApp(
  navigator.userAgent || navigator.vendor || (window as any).opera
);

export const IS_IN_APP =
  inApp.isInApp &&
  !['chrome', 'firefox', 'safari', 'ie'].includes(inApp.browser);
