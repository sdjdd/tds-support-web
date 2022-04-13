import {
  ComponentPropsWithoutRef,
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { UseQueryResult } from 'react-query';
import { keyBy } from 'lodash-es';

import { CategorySchema, useCategories } from '@/api/category';

type CategoryPathGetter = (id: number) => CategorySchema[];

const CategoryContext = createContext<{
  result?: UseQueryResult<CategorySchema[], Error>;
  getPath?: CategoryPathGetter;
}>({});

function makeCategoryPathGetter(categories: CategorySchema[]) {
  const categoryById = keyBy(categories, 'id');
  const pathById: Record<number, CategorySchema[]> = {};
  const get: CategoryPathGetter = (id) => {
    const cached = pathById[id];
    if (cached) {
      return cached;
    }
    const category = categoryById[id];
    if (!category) {
      return [];
    }
    const path = category.parentId ? get(category.parentId).concat(category) : [category];
    pathById[id] = path;
    return path;
  };
  return get;
}

export function CategoryProvider({ children }: PropsWithChildren<{}>) {
  const result = useCategories();

  const { data: categories } = result;

  const getPath = useMemo(() => makeCategoryPathGetter(categories ?? []), [categories]);

  return (
    <CategoryContext.Provider value={{ result, getPath }}>{children}</CategoryContext.Provider>
  );
}

export interface CategoryPathProps extends ComponentPropsWithoutRef<'span'> {
  categoryId: number;
}

export function CategoryPath({ categoryId, ...props }: CategoryPathProps) {
  const { getPath, result } = useContext(CategoryContext);

  const name = useMemo(() => {
    if (!getPath) {
      throw new Error('component CategoryPath must under a CategoryProvicer');
    }
    return getPath(categoryId)
      .map((c) => c.name)
      .join(' / ');
  }, [categoryId, getPath]);

  return <span {...props}>{result?.isLoading ? 'Loading...' : name}</span>;
}
