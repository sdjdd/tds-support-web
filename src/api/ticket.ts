import { client } from '@/http';
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';

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

export interface TicketDetailSchema extends TicketSchema {
  content: string;
  htmlContent: string;
}

export interface ReplySchema {
  id: number;
  authorId: number;
  content: string;
  htmlContent: string;
  public: boolean;
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

export async function fetchTicket(id: number | string) {
  const res = await client.get<{ ticket: TicketDetailSchema }>(`/api/v1/tickets/${id}`);
  return res.data.ticket;
}

export async function fetchReplies(ticketId: number | string) {
  const res = await client.get<{ replies: ReplySchema[] }>(`/api/v1/tickets/${ticketId}/replies`);
  return res.data.replies;
}

export interface UpdateTicketData {
  ticketId: number | string;
  categoryId?: number;
  assigneeId?: number | null;
  title?: string;
  content?: string;
}

export async function updateTicket({ ticketId, ...data }: UpdateTicketData) {
  const res = await client.patch<{ ticket: TicketDetailSchema }>(
    `/api/v1/tickets/${ticketId}`,
    data
  );
  return res.data.ticket;
}

export interface CreateReplyData {
  ticketId: number | string;
  content: string;
  public?: boolean;
}

export async function createReply({ ticketId, ...data }: CreateReplyData) {
  const res = await client.post<{ reply: ReplySchema }>(
    `/api/v1/tickets/${ticketId}/replies`,
    data
  );
  return res.data.reply;
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

export const useTicket = (
  id: number | string,
  options?: UseQueryOptions<TicketDetailSchema, Error>
) =>
  useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
    ...options,
  });

export const useReplies = (id: number | string, options?: UseQueryOptions<ReplySchema[], Error>) =>
  useQuery({
    queryKey: ['replies', id],
    queryFn: () => fetchReplies(id),
    ...options,
  });

export const useCreateReply = (options?: UseMutationOptions<ReplySchema, Error, CreateReplyData>) =>
  useMutation({
    mutationFn: createReply,
    ...options,
  });

export const useUpdateTicket = (
  options?: UseMutationOptions<TicketDetailSchema, Error, UpdateTicketData>
) =>
  useMutation({
    mutationFn: updateTicket,
    ...options,
  });
