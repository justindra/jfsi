import { redirect } from 'react-router-dom';

export const AuthSignOutPage: React.FC = () => {
  return <div>Signing out...</div>;
};

export function createSignOutLoader({ homeUrl = '/' }: { homeUrl?: string }) {
  return async function loader() {
    localStorage.clear();

    // Redirect to the home page
    return redirect(homeUrl, 302);
  };
}
