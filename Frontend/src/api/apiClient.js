import axios from 'axios';
// Token ko localStorage se manage karne ke liye helper
import { getToken } from '../utils/tokenManager'; 

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

// Ek naya Axios instance banayein
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Yeh function har request ke bheje jaane se pehle chalega
apiClient.interceptors.request.use(
  (config) => {
    // localStorage se JWT token prapt karein
    const token = getToken(); 
    if (token) {
      // Agar token hai, to use Authorization header mein add karein
      config.headers['Authorization'] = `${token}`; // Token pehle se hi 'Bearer ' ke saath save hoga
    }
    return config; // Updated config ko aage bhejein
  },
  (error) => {
    // Request error hone par use reject karein
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Optional but Recommended) ---
// Yeh function har response ke aane ke baad chalega
// Iska istemaal global error handling (jaise 401 Unauthorized par logout karna) ke liye kiya jaa sakta hai
apiClient.interceptors.response.use(
  (response) => {
    // Agar response successful (2xx) hai, to use seedha return karein
    return response;
  },
  (error) => {
    // Agar server se error response aata hai (4xx, 5xx)
    if (error.response) {
      // Example: Agar 401 Unauthorized error aata hai (token invalid/expired)
      // Toh user ko logout karke login page par bhej sakte hain
      // if (error.response.status === 401) {
      //   // logoutUser(); // Function to remove token and redirect
      //   console.error("Authentication Error:", error.response.data);
      // }
      console.error('API Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Agar request bheji gayi lekin response nahi mila (server down?)
      console.error('API Network Error:', error.request);
    } else {
      // Request set up karte waqt hi koi error aa gaya
      console.error('API Config Error:', error.message);
    }
    // Error ko aage reject karein taaki calling function (e.g., in authService.js) use handle kar sake
    return Promise.reject(error);
  }
);


export default apiClient;
