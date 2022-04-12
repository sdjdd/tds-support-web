import {
  forwardRef,
  Key,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import cx from 'classnames';
import { pick } from 'lodash-es';
import { produce } from 'immer';

import {
  CategorySchema,
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategories,
  useUpdateCategory,
} from '@/api/category';
import { Button, Checkbox, Spin, Table, message, Modal, Breadcrumb } from '@/components/antd';
import { CategoryTreeNode, makeCategoryTree, useCategoryTree } from './utils/category-tree';
import { CategoryForm } from './CategoryForm';

const { Column } = Table;

function NameCell({ category }: { category: CategorySchema }) {
  const { id, name, active } = category;
  return (
    <>
      <Link className={cx({ 'opacity-60': !active })} to={id.toString()}>
        {name}
        {!active && ' (停用)'}
      </Link>
    </>
  );
}

interface CategoryTableProps {
  categories?: CategorySchema[];
  loading?: boolean;
  expandedRowKeys?: readonly Key[];
  onExpandedRowsChange?: (keys: readonly Key[]) => void;
}

function CategoryTable({
  categories,
  loading,
  expandedRowKeys,
  onExpandedRowsChange,
}: CategoryTableProps) {
  const categoryTree = useCategoryTree(categories);

  return (
    <Table
      rowKey="id"
      size="small"
      loading={loading}
      dataSource={categoryTree}
      pagination={false}
      expandable={{ expandedRowKeys, onExpandedRowsChange }}
    >
      <Column key="name" title="名称" render={(category) => <NameCell category={category} />} />
    </Table>
  );
}

interface SortCategoryTableRef {
  getData: () => { id: number; position: number }[];
}

interface SortCategoryTableProps {
  categories: CategorySchema[];
  ref?: SortCategoryTableRef;
}

const SortCategoryTable = forwardRef<SortCategoryTableRef, SortCategoryTableProps>(
  ({ categories }, ref) => {
    const [categoryTree, setCategoryTree] = useState(() => {
      const activeCategories = categories.filter((c) => c.active);
      return makeCategoryTree(activeCategories);
    });

    const [changed, setChanged] = useState<Record<string, number>>({});

    const handleMove = (node: CategoryTreeNode, from: number, to: number) => {
      const categories = node.parent ? node.parent.children! : categoryTree;
      categories.splice(from, 1);
      categories.splice(to, 0, node);
      setChanged((prev) => {
        const next = { ...prev };
        categories.forEach(({ id }, position) => (next[id] = position));
        return next;
      });
      setCategoryTree([...categoryTree]);
    };

    useImperativeHandle(ref, () => ({
      getData: () =>
        Object.entries(changed).map(([id, position]) => ({
          id: parseInt(id),
          position,
        })),
    }));

    return (
      <Table dataSource={categoryTree} rowKey="id" size="small" pagination={false}>
        <Column key="name" title="名称" render={(category) => <NameCell category={category} />} />
        <Column
          key="actions"
          render={(node: CategoryTreeNode, _, i) => {
            const length = node.parent ? node.parent.children!.length : categoryTree.length;
            return (
              <>
                <Button
                  className="flex"
                  size="small"
                  icon={<AiOutlineUp className="m-auto" />}
                  disabled={i === 0}
                  onClick={() => handleMove(node, i, i - 1)}
                  style={{ padding: 0, height: 20 }}
                />
                <Button
                  className="flex ml-1"
                  size="small"
                  icon={<AiOutlineDown className="m-auto" />}
                  disabled={i === length - 1}
                  onClick={() => handleMove(node, i, i + 1)}
                  style={{ padding: 0, height: 20 }}
                />
              </>
            );
          }}
        />
      </Table>
    );
  }
);

interface SortCategoryModalProps extends SortCategoryTableProps {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onOk: (datas: ReturnType<SortCategoryTableRef['getData']>) => void;
}

function SortCategoryModal({ visible, loading, onCancel, onOk, ...props }: SortCategoryModalProps) {
  const $sortTable = useRef<SortCategoryTableRef>(null!);

  return (
    <Modal
      destroyOnClose
      title="调整顺序"
      visible={visible}
      cancelButtonProps={{ disabled: loading }}
      onCancel={loading ? undefined : onCancel}
      okButtonProps={{ loading }}
      okText="Save"
      onOk={() => onOk($sortTable.current.getData())}
    >
      <SortCategoryTable {...props} ref={$sortTable} />
    </Modal>
  );
}

export function CategoryList() {
  const [showInactive, setShowInactive] = useState(false);
  const [expendedRowKeys, setExpendedRowKeys] = useState<readonly Key[]>();
  const [sorting, setSorting] = useState(false);

  const { data: categories, isFetching } = useCategories();

  const expandAll = useCallback(() => {
    if (categories) {
      setExpendedRowKeys(categories.map((c) => c.id));
    }
  }, [categories]);

  useEffect(() => {
    if (categories && !expendedRowKeys) {
      expandAll();
    }
  }, [categories, expendedRowKeys, expandAll]);

  const filteredCategories = useMemo(() => {
    if (categories) {
      return showInactive ? categories : categories.filter((c) => c.active);
    }
  }, [categories, showInactive]);

  const queryClient = useQueryClient();

  const { mutate, isLoading: updating } = useUpdateCategories({
    onSuccess: () => {
      message.success('更新顺序成功');
      queryClient.invalidateQueries('categories');
      setSorting(false);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  return (
    <div className="p-10">
      <div className="mb-5 flex justify-between items-center">
        <div>
          <Button className="mr-1" size="small" onClick={expandAll}>
            全部展开
          </Button>
          <Button className="mr-2" size="small" onClick={() => setExpendedRowKeys([])}>
            全部折叠
          </Button>
          <Checkbox
            checked={showInactive}
            disabled={isFetching}
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            显示已停用的分类
          </Checkbox>
        </div>
        <div>
          <Button disabled={isFetching} onClick={() => setSorting(true)}>
            调整顺序
          </Button>
          <Link to="new">
            <Button className="ml-2" type="primary">
              创建分类
            </Button>
          </Link>
        </div>
      </div>

      <SortCategoryModal
        categories={categories!}
        visible={sorting}
        loading={updating}
        onCancel={() => setSorting(false)}
        onOk={mutate}
      />

      <CategoryTable
        loading={isFetching}
        categories={filteredCategories}
        expandedRowKeys={expendedRowKeys}
        onExpandedRowsChange={setExpendedRowKeys}
      />
    </div>
  );
}

export function NewCategory() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate, isLoading } = useCreateCategory({
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      message.success('创建成功');
      navigate('..');
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  return (
    <div className="p-10">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="..">分类</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>添加</Breadcrumb.Item>
      </Breadcrumb>

      <CategoryForm loading={isLoading} onSubmit={mutate} />
    </div>
  );
}

export function CategoryDetail() {
  const { id } = useParams<'id'>();
  const { data: category, isLoading: loadingCategories } = useCategory(id!);

  const initData = useMemo(() => {
    return pick(category, ['name', 'description', 'parentId']);
  }, [category]);

  const queryClient = useQueryClient();
  const { mutate, isLoading } = useUpdateCategory({
    onSuccess: (data) => {
      queryClient.setQueryData(['category', id], data);
      queryClient.setQueriesData<CategorySchema[] | undefined>(['categories'], (categories) => {
        if (categories) {
          return produce(categories, (draft) => {
            const index = draft.findIndex((c) => c.id === data.id);
            if (index !== -1) {
              draft.splice(index, 1, data);
            }
          });
        }
      });
      message.success('更新成功');
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  if (loadingCategories) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin />
      </div>
    );
  }

  if (!category) {
    return <Navigate to=".." />;
  }

  return (
    <div className="p-10">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="..">分类</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{id}</Breadcrumb.Item>
      </Breadcrumb>

      <CategoryForm
        initData={initData}
        loading={isLoading}
        currentCategoryId={category.id}
        categoryActive={category.active}
        onSubmit={(data) => mutate({ ...data, id: id! })}
        onChangeCategoryActive={(active) => mutate({ active, id: id! })}
      />
    </div>
  );
}
