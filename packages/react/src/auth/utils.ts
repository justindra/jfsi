import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants';

export type User = {
  avatarUrl: string;
  name: string;
  userId: string;
};

export function getToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? token : null;
}

export function isSignedIn() {
  return !!getToken();
}

export function getUser() {
  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? (JSON.parse(user) as User) : null;
}
