import { forwardRef } from 'react';
import { RefSelectProps } from 'antd/lib/select';

import { useCategories } from '@/api/category';
import { useCategoryTree } from './utils/category-tree';

import { TreeSelect, TreeSelectProps } from '@/components/antd';

export const CategoryTreeSelect = forwardRef<RefSelectProps, TreeSelectProps<number | undefined>>(
  (props, ref) => {
    const { data: categories, isLoading } = useCategories();
    const categoryTree = useCategoryTree(categories);

    return (
      <TreeSelect
        {...props}
        ref={ref}
        showSearch
        treeNodeFilterProp="name"
        loading={isLoading}
        treeData={categoryTree}
        fieldNames={{ label: 'name', value: 'id' }}
      />
    );
  }
);
