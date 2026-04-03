import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';

// API Base URL from configuration
const API_BASE_URL = config.api.baseUrl;

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${config.api.version}`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
      
      // 处理特定错误码
      switch (status) {
        case 401:
          // 未授权，清除 token 并重定向到登录页
          localStorage.removeItem('token');
          break;
        case 403:
          console.error('Forbidden: 没有权限访问该资源');
          break;
        case 404:
          console.error('Not Found: 请求的资源不存在');
          break;
        case 500:
          console.error('Server Error: 服务器内部错误');
          break;
        default:
          console.error(`Unknown Error: ${status}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('Network Error: 无法连接到服务器');
    } else {
      // 请求配置出错
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

// 封装 POST 请求
export const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

// 封装 PUT 请求
export const put = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

// 封装 DELETE 请求
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

export default apiClient;
