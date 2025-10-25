// A key to use for storing the token in localStorage
const TOKEN_KEY = 'tasksphere_token';

/**
 * Saves the authentication token to localStorage.
 * Assumes the token received from the backend includes the 'Bearer ' prefix.
 * @param {string} token - The JWT token string (e.g., "Bearer eyJhbGciOi...")
 */
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

// Optional: Function to decode the token (requires jwt-decode library)
// import { jwtDecode } from 'jwt-decode'; // Run: npm install jwt-decode
// export const decodeToken = () => {
//   const token = getToken();
//   if (token) {
//     try {
//       // Remove 'Bearer ' prefix if present before decoding
//       const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
//       return jwtDecode(actualToken);
//     } catch (error) {
//       console.error("Failed to decode token:", error);
//       removeToken(); // Remove invalid token
//       return null;
//     }
//   }
//   return null;
// };
