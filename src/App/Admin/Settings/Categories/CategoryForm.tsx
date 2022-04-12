import { forwardRef, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { RefSelectProps } from 'antd/lib/select';

import { useCategories } from '@/api/category';
import { useCategoryTree } from './utils/category-tree';

import { Button, Form, Input, TreeSelect, TreeSelectProps } from '@/components/antd';

const { TextArea } = Input;

const FORM_ITEM_STYLE = { marginBottom: 16 };

const CategoryTreeSelect = forwardRef<RefSelectProps, TreeSelectProps<number | undefined>>(
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

export interface CategoryFormData {
  name: string;
  description?: string;
  parentId?: number;
}

export interface CategoryFormProps {
  currentCategoryId?: number;
  categoryActive?: boolean;
  onChangeCategoryActive?: (active: boolean) => void;
  initData?: Partial<CategoryFormData>;
  loading?: boolean;
  onSubmit: (data: CategoryFormData) => void;
}

export function CategoryForm({
  currentCategoryId,
  categoryActive,
  onChangeCategoryActive,
  initData,
  loading,
  onSubmit,
}: CategoryFormProps) {
  const { control, handleSubmit } = useForm({ defaultValues: initData });

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const categoryTree = useCategoryTree(categories);

  const findCategoryTreeNode = useCallback(
    (id: number) => {
      if (categoryTree) {
        const queue = [...categoryTree];
        while (queue.length) {
          const first = queue.shift()!;
          if (first.id === id) {
            return first;
          }
          first.children?.forEach((c) => queue.push(c));
        }
      }
      return undefined;
    },
    [categoryTree]
  );

  const validateParentId = useCallback(
    (parentId?: number) => {
      if (parentId && currentCategoryId) {
        const target = findCategoryTreeNode(currentCategoryId);
        if (target) {
          const queue = [target];
          while (queue.length) {
            const first = queue.shift()!;
            if (first.id === parentId) {
              return '父分类不能是分类自己或自己的子分类。';
            }
            first.children?.forEach((c) => queue.push(c));
          }
        }
      }
      return true;
    },
    [findCategoryTreeNode, currentCategoryId]
  );

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit as any)}>
      <Controller
        control={control}
        name="name"
        rules={{ required: '请填写此字段' }}
        render={({ field, fieldState: { error } }) => (
          <Form.Item
            required
            label="名称"
            htmlFor="category_form_name"
            validateStatus={error ? 'error' : undefined}
            help={error?.message}
            style={FORM_ITEM_STYLE}
          >
            <Input {...field} autoFocus id="category_form_name" />
          </Form.Item>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Form.Item label="描述" htmlFor="category_form_desc" style={FORM_ITEM_STYLE}>
            <TextArea {...field} id="category_form_desc" />
          </Form.Item>
        )}
      />

      <Controller
        control={control}
        name="parentId"
        rules={{ validate: validateParentId }}
        render={({ field, field: { onChange }, fieldState: { error } }) => (
          <Form.Item
            label="父分类"
            htmlFor="category_form_parent_id"
            validateStatus={error ? 'error' : undefined}
            help={error?.message}
            style={FORM_ITEM_STYLE}
          >
            <CategoryTreeSelect
              {...field}
              onChange={(value, ...params) => onChange(value ?? null, ...params)}
              allowClear
              id="category_form_parent_id"
            />
          </Form.Item>
        )}
      />

      <div className="mt-6 flex">
        <div className="grow">
          <Button type="primary" htmlType="submit" disabled={loadingCategories} loading={loading}>
            保存
          </Button>
          <Link className="ml-2" to="..">
            <Button disabled={loading}>返回</Button>
          </Link>
        </div>
        {categoryActive === true && (
          <Button danger disabled={loading} onClick={() => onChangeCategoryActive?.(false)}>
            停用
          </Button>
        )}
        {categoryActive === false && (
          <Button disabled={loading} onClick={() => onChangeCategoryActive?.(true)}>
            启用
          </Button>
        )}
      </div>
    </Form>
  );
}
