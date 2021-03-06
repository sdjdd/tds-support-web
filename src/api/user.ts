import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';

import { client } from '@/http';

export interface UserSchema {
  id: number;
  username: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  role: 'end-user' | 'agent' | 'admin';
}

export interface FindUsersOptions {
  page?: number;
  pageSize?: number;
  role?: UserSchema['role'] | UserSchema['role'][];
}

export async function findUsers(options?: FindUsersOptions) {
  const { data } = await client.get<{ users: UserSchema[] }>('/api/v1/users', { params: options });
  return data.users;
}

export async function searchUsers(filter: string) {
  const { data } = await client.get<{ users: UserSchema[] }>('/api/v1/users/search', {
    params: { filter },
  });
  return data.users;
}

export async function fetchUsers(ids: (number | string)[]) {
  const res = await client.get<{ users: UserSchema[] }>('/api/v1/users/show-many', {
    params: { ids: ids.join(',') },
  });
  return res.data.users;
}

export async function fetchUser(id: number | string) {
  const res = await client.get<{ user: UserSchema }>(`/api/v1/users/${id}`);
  return res.data.user;
}

export type UpdateUserData = Partial<Pick<UserSchema, 'role'>>;

export async function updateUser(id: number | string, data: UpdateUserData) {
  const {
    data: { user },
  } = await client.patch<{ user: UserSchema }>(`/api/v1/users/${id}`, data);
  return user;
}

export interface UseUsersOptions extends FindUsersOptions {
  queryOptions?: UseQueryOptions<UserSchema[], Error>;
}

export const useUsers = ({ queryOptions, ...options }: UseUsersOptions = {}) =>
  useQuery({
    queryKey: ['users', options],
    queryFn: () => findUsers(options),
    ...queryOptions,
  });

export const useUser = (id: number | string, options?: UseQueryOptions<UserSchema, Error>) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    ...options,
  });

export const useManyUsers = (
  ids: (number | string)[],
  options?: UseQueryOptions<UserSchema[], Error>
) =>
  useQuery({
    queryKey: ['users', ids],
    queryFn: () => fetchUsers(ids),
    ...options,
  });

export const useAgents = (options?: UseQueryOptions<UserSchema[], Error>) =>
  useQuery({
    queryKey: ['agents'],
    queryFn: () =>
      findUsers({
        role: ['admin', 'agent'],
        pageSize: 100,
      }),
    staleTime: Infinity,
    cacheTime: Infinity,
    ...options,
  });

export const useSearchUsers = (filter: string, options?: UseQueryOptions<UserSchema[], Error>) =>
  useQuery({
    queryKey: ['searchUserResult', filter],
    queryFn: () => searchUsers(filter),
    ...options,
  });

export const useUpdateUser = (
  options?: UseMutationOptions<UserSchema, Error, { id: number | string } & UpdateUserData>
) =>
  useMutation({
    mutationFn: ({ id, ...data }) => updateUser(id, data),
    ...options,
  });
