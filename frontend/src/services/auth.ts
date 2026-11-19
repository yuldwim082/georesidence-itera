const TOKEN_KEY = 'georesidence_admin_token';
const USERNAME_KEY = 'georesidence_admin_user';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  },
  setAuth(token: string, username: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
  },
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
