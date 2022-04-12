import axios, { AxiosError } from 'axios';

export const client = axios.create();

client.interceptors.response.use(
  (res) => {
    return res;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    throw error;
  }
);
