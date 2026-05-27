import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

export const authClient = axios.create({
  baseURL: GATEWAY_URL ?? '/auth-api',
  withCredentials: true,
});

export const storeClient = axios.create({
  baseURL: GATEWAY_URL ?? '/store-api',
  withCredentials: true,
});

export const notiClient = axios.create({
  baseURL: GATEWAY_URL ?? '/noti-api',
  withCredentials: true,
});

const setAuthInterceptor = (client: typeof authClient) => {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const isLoginRequest = error.config?.url === '/login';
      const isOnLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';

      if (error.response?.status === 401 && !isLoginRequest && !isOnLoginPage) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

setAuthInterceptor(authClient);
setAuthInterceptor(storeClient);
setAuthInterceptor(notiClient);
