import axios, { type AxiosRequestConfig } from 'axios';
import { isFirebaseMode } from '@/lib/firebase';
import { firebaseRequest } from '@/api/firebaseBackend';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const PUBLIC_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function isPublicAuthCall(url?: string) {
  if (!url) return false;
  return PUBLIC_AUTH_ENDPOINTS.some((ep) => url.includes(ep));
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && !isPublicAuthCall(original.url)) {
      const refreshToken = localStorage.getItem('ms_refresh_token');
      if (!refreshToken) {
        notifySessionRevoked();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (newToken) {
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosClient(original));
            } else {
              reject(error);
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('ms_access_token', data.accessToken);
        localStorage.setItem('ms_refresh_token', data.refreshToken);
        window.dispatchEvent(
          new CustomEvent('qingji:tokens-refreshed', {
            detail: { accessToken: data.accessToken, refreshToken: data.refreshToken, sessionId: data.sessionId },
          })
        );
        pendingQueue.forEach((cb) => cb(data.accessToken));
        pendingQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(original);
      } catch (refreshErr) {
        pendingQueue.forEach((cb) => cb(null));
        pendingQueue = [];
        notifySessionRevoked();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export function notifySessionRevoked() {
  const hadToken = Boolean(localStorage.getItem('ms_access_token'));
  localStorage.removeItem('ms_access_token');
  localStorage.removeItem('ms_refresh_token');
  if (hadToken) {
    window.dispatchEvent(new CustomEvent('qingji:session-revoked'));
  } else if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/s/')) {
    window.location.href = '/login';
  }
}

async function runFirebaseCall(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  try {
    return await firebaseRequest(method, url, data, {
      params: config?.params,
      responseType: config?.responseType,
    });
  } catch (err: any) {
    if (err?.response?.status === 401 && !isPublicAuthCall(url)) {
      notifySessionRevoked();
    }
    throw err;
  }
}

const http = {
  get(url: string, config?: AxiosRequestConfig) {
    if (isFirebaseMode) return runFirebaseCall('GET', url, undefined, config);
    return axiosClient.get(url, config);
  },
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    if (isFirebaseMode) return runFirebaseCall('POST', url, data, config);
    return axiosClient.post(url, data, config);
  },
  put(url: string, data?: any, config?: AxiosRequestConfig) {
    if (isFirebaseMode) return runFirebaseCall('PUT', url, data, config);
    return axiosClient.put(url, data, config);
  },
  delete(url: string, config?: AxiosRequestConfig) {
    if (isFirebaseMode) return runFirebaseCall('DELETE', url, undefined, config);
    return axiosClient.delete(url, config);
  },
};

export default http;
