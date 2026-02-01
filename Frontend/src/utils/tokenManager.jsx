// A key to use for storing the token in localStorage
const TOKEN_KEY = 'tasksphere_token';

export const saveToken = (token) => {
  if (token && typeof token === 'string') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    console.error("Attempted to save invalid token:", token);
  }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The token string if found, otherwise null.
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

