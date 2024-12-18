import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

interface RequestOptions extends AxiosRequestConfig {
  retries?: number; // Number of retries (default: 3)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  timeout?: number; // Request timeout in ms (default: 5000)
}

const apiRequest = async <T>(config: RequestOptions): Promise<AxiosResponse<T>> => {
  const { retries = 3, retryDelay = 1000, timeout = 5000, ...axiosConfig } = config;

  let attempt = 0;

  const executeRequest = async (): Promise<AxiosResponse<T>> => {
    try {
      const response = await axios.request<T>({
        timeout,
        ...axiosConfig
      });
      return response;
    } catch (error) {
      if (attempt < retries) {
        attempt++;
        await new Promise((resolve) => {
          setTimeout(resolve, retryDelay * attempt);
        });
        return executeRequest();
      }
      throw error;
    }
  };

  return executeRequest();
};

export default apiRequest;
