import jwtDecode from 'jwt-decode';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants';

export const AuthCallbackPage: React.FC = () => {
  return <div>Loading authentication...</div>;
};

type CallbackLoaderParams = {
  authEndpoint: string;
  signInUrl?: string;
  homeUrl?: string;
};

export function createCallbackLoader({
  authEndpoint,
  signInUrl = '/auth/sign-in',
  homeUrl = '/app',
}: CallbackLoaderParams) {
  return async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      throw new Error('Code missing');
    }

    // Exchange the code for an access token
    const response = await fetch(authEndpoint + '/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'local',
        code,
        redirect_uri: `${url.origin}${url.pathname}`,
      }),
    }).then((r) => r.json());

    if (!response.access_token) {
      throw redirect(signInUrl, 302);
    }

    const decoded = jwtDecode(response.access_token);

    // Set the access token as a cookie
    localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify((decoded as any).properties)
    );

    // Redirect to the home page
    return redirect(homeUrl, 302);
  };
}
