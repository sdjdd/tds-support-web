import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';

import { client } from '@/http';

export interface CategorySchema {
  id: number;
  parentId?: number;
  name: string;
  description: string;
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCategories() {
  const res = await client.get<{ categories: CategorySchema[] }>('/api/v1/categories');
  return res.data.categories;
}

export async function fetchCategory(id: number | string) {
  const res = await client.get<{ category: CategorySchema }>(`/api/v1/categories/${id}`);
  return res.data.category;
}

export interface CreateCategoryData {
  name: string;
  parentId?: number;
  description?: string;
}

export async function createCategory(data: CreateCategoryData) {
  const res = await client.post<{ category: CategorySchema }>('/api/v1/categories', data);
  return res.data.category;
}

export interface UpdateCategoryData {
  parentId?: number | null;
  name?: string;
  description?: string;
  active?: boolean;
}

export async function updateCategory(id: number | string, data: UpdateCategoryData) {
  const res = await client.patch<{ category: CategorySchema }>(`/api/v1/categories/${id}`, data);
  return res.data.category;
}

export async function updateCategories(categories: ({ id: number } & UpdateCategoryData)[]) {
  const res = await client.post<{ categories: CategorySchema[] }>(
    '/api/v1/categories/batch-update',
    { categories }
  );
  return res.data.categories;
}

export const useCategory = (
  id: number | string,
  options?: UseQueryOptions<CategorySchema, Error>
) =>
  useQuery({
    queryKey: ['category', id],
    queryFn: () => fetchCategory(id),
    ...options,
  });

export interface UseCategoriesOptions {
  queryOptions?: UseQueryOptions<CategorySchema[], Error>;
}

export const useCategories = ({ queryOptions }: UseCategoriesOptions = {}) =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
    cacheTime: Infinity,
    ...queryOptions,
  });

export const useCreateCategory = (
  options?: UseMutationOptions<CategorySchema, Error, CreateCategoryData>
) =>
  useMutation({
    mutationFn: createCategory,
    ...options,
  });

export const useUpdateCategory = (
  options?: UseMutationOptions<CategorySchema, Error, { id: number | string } & UpdateCategoryData>
) =>
  useMutation({
    mutationFn: ({ id, ...data }) => updateCategory(id, data),
    ...options,
  });

export const useUpdateCategories = (
  options?: UseMutationOptions<CategorySchema[], Error, Parameters<typeof updateCategories>[0]>
) =>
  useMutation({
    mutationFn: updateCategories,
    ...options,
  });
