import { QueryClient } from 'react-query';
import { AxiosError } from 'axios';

import { message } from '@/components/antd';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      onError: (error) => {
        if (error instanceof Error) {
          message.error(error.message);
          if ((error as AxiosError).response?.status === 401) {
            location.href = '/login';
          }
        }
      },
    },
  },
});
