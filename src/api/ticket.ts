import { client } from '@/http';
import { useQuery, UseQueryOptions } from 'react-query';

export interface TicketSchema {
  id: number;
  categoryId: number;
  requesterId: number;
  assigneeId?: number;
  title: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchTicketsOptions {
  filter?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface SearchTicketsResult {
  filter: {
    properties?: Record<
      string,
      {
        eq?: string[];
        gt?: string;
        gte?: string;
        lt?: string;
        lte?: string;
      }
    >;
    terms?: { value: string; quoted?: true }[];
  };
  count: number;
  tickets: TicketSchema[];
}

export async function searchTickets(options?: SearchTicketsOptions) {
  const res = await client.get<SearchTicketsResult>('/api/v1/tickets/search', { params: options });
  return res.data;
}

export interface UseSearchTicketsOptions extends SearchTicketsOptions {
  queryOptions?: UseQueryOptions<SearchTicketsResult, Error>;
}

export const useSearchTickets = ({ queryOptions, ...options }: UseSearchTicketsOptions) =>
  useQuery({
    queryKey: ['tickets', options],
    queryFn: () => searchTickets(options),
    ...queryOptions,
  });
