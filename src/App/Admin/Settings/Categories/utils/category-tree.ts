import { groupBy, clone } from 'lodash-es';

import { CategorySchema } from '@/api/category';
import { useMemo } from 'react';

export interface CategoryTreeNode extends CategorySchema {
  parent?: CategoryTreeNode;
  children?: CategoryTreeNode[];
}

export function makeCategoryTree(categories: CategorySchema[]): CategoryTreeNode[] {
  const categoriesByParentId = groupBy(categories, 'parentId');

  const sortFn = (a: CategoryTreeNode, b: CategoryTreeNode) => {
    if (a.active === b.active) {
      return a.position - b.position;
    }
    return a.active ? -1 : 1;
  };

  const dfs = (parentId: string) => {
    const currentLevel: CategoryTreeNode[] = categoriesByParentId[parentId]?.map(clone);
    if (!currentLevel) {
      return [];
    }
    currentLevel.sort(sortFn);
    currentLevel.forEach((category) => {
      const children = dfs(category.id.toString());
      if (children.length) {
        children.forEach((child) => (child.parent = category));
        category.children = children;
      }
    });
    return currentLevel;
  };

  return dfs('undefined');
}

export function useCategoryTree(categories: CategorySchema[] | undefined) {
  return useMemo(() => {
    return categories && makeCategoryTree(categories);
  }, [categories]);
}
