import Cookies from 'js-cookie';
import { redirect } from 'react-router-dom';
import { AUTH_COOKIE_TOKEN, AUTH_COOKIE_USER } from './constants';

export const AuthSignOutPage: React.FC = () => {
  return <div>Signing out...</div>;
};

export function createSignOutLoader({ homeUrl = '/' }: { homeUrl?: string }) {
  return async function loader() {
    // Remove the authentication cookies
    Cookies.remove(AUTH_COOKIE_TOKEN);
    Cookies.remove(AUTH_COOKIE_USER);

    localStorage.clear();

    // Redirect to the home page
    return redirect(homeUrl, 302);
  };
}
