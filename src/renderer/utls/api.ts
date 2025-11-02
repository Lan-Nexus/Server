import axios from 'axios';
import router from '../router';

// Function to get auth token with expiration check
function getAuthToken() {
  const token = localStorage.getItem('token');
  const expires = localStorage.getItem('token_expires');
  
  if (!token || !expires) {
    return null;
  }
  
  // Check if token is expired
  const expiresDate = new Date(expires);
  if (new Date() >= expiresDate) {
    // Token is expired, clear it
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires');
    localStorage.removeItem('token_role');
    localStorage.removeItem('user_data');
    return null;
  }
  
  return token;
}

const api = axios.create({
  baseURL: '/',
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            router.currentRoute.value.path !== '/login'
        ) {
            // Clear expired/invalid auth data
            localStorage.removeItem('token');
            localStorage.removeItem('token_expires');
            localStorage.removeItem('token_role');
            localStorage.removeItem('user_data');
            
            const currentPath = router.currentRoute.value.fullPath;
            router.push({ path: '/login', query: { redirect: currentPath } });
        }
        return Promise.reject(error);
    }
);

export default api;
