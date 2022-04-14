import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import cx from 'classnames';

import { SearchTicketsResult } from '@/api/ticket';
import { Button, Input } from '@/components/antd';
import { SearchUser } from '@/App/Admin/components/SearchUser';
import { CategoryTreeSelect } from '@/App/Admin/Settings/Categories/CategoryTreeSelect';
import { AssigneeSelect } from './AssigneeSelect';
import { CreatedAtSelect, CreatedAtValue } from './CreatedAtSelect';
import { StatusSelect } from './StatusSelect';

interface Filters {
  keyword?: string;
  requesterId?: number;
  assigneeId?: (number | string)[];
  createdAt?: CreatedAtValue;
  categoryId?: number;
  status?: number[];
}

function Field({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="mt-4">
      <label className="block pb-1.5 text-[#475867] text-sm font-medium">{title}</label>
      {children}
    </div>
  );
}

export interface FilterFormProps {
  className?: string;
  filters?: SearchTicketsResult['filter'];
  onChange: (filters: Filters) => void;
}

export function FilterForm({ className, filters, onChange }: FilterFormProps) {
  const [tempFilters, setTempFilters] = useState<Filters>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const tempFilters: Filters = {};
    if (filters) {
      const { terms, properties } = filters;
      if (terms) {
        tempFilters.keyword = terms
          .map((term) => (term.quoted ? `"${term.value}"` : term.value))
          .join(' ');
      }
      if (properties) {
        const { requesterId, assigneeId, createdAt, categoryId, status } = properties;
        if (requesterId?.eq) {
          tempFilters.requesterId = parseInt(requesterId.eq[0]);
        }
        if (assigneeId?.eq) {
          tempFilters.assigneeId = assigneeId.eq.map((id) => (id === 'none' ? id : parseInt(id)));
        }
        if (createdAt) {
          if (createdAt.eq) {
            tempFilters.createdAt = { type: 'eq', value: createdAt.eq[0] };
          } else if (createdAt.gt && createdAt.lt) {
            tempFilters.createdAt = { type: 'range', value: [createdAt.gt, createdAt.lt] };
          } else if (createdAt.gt) {
            tempFilters.createdAt = { type: 'gt', value: createdAt.gt };
          } else if (createdAt.lt) {
            tempFilters.createdAt = { type: 'lt', value: createdAt.lt };
          }
        }
        if (categoryId?.eq) {
          tempFilters.categoryId = parseInt(categoryId.eq[0]);
        }
        if (status?.eq) {
          tempFilters.status = status.eq.map((s) => parseInt(s));
        }
      }
    }
    setTempFilters(tempFilters);
    setIsDirty(false);
  }, [filters]);

  const merge = useCallback((filters: Filters) => {
    setTempFilters((prev) => ({ ...prev, ...filters }));
    setIsDirty(true);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();

  const { keyword, requesterId, assigneeId, createdAt, categoryId, status } = tempFilters;

  const handleChange = () => {
    const filters: string[] = [];

    if (keyword) {
      filters.push(keyword);
    }

    if (requesterId) {
      filters.push(`requesterId:${requesterId}`);
    }

    if (assigneeId?.length) {
      assigneeId.map((id) => `assigneeId:${id}`).forEach((t) => filters.push(t));
    }

    if (createdAt && createdAt.type !== 'all' && createdAt.value) {
      switch (createdAt.type) {
        case 'eq':
          filters.push(`createdAt:${createdAt.value}`);
          break;
        case 'gt':
          filters.push(`createdAt>${createdAt.value}`);
          break;
        case 'lt':
          filters.push(`createdAt<${createdAt.value}`);
          break;
        case 'range':
          filters.push(`createdAt>${createdAt.value[0]}`);
          filters.push(`createdAt<${createdAt.value[1]}`);
          break;
      }
    }

    if (categoryId) {
      filters.push(`categoryId:${categoryId}`);
    }

    if (status?.length) {
      status.forEach((status) => filters.push(`status:${status}`));
    }

    const filter = filters.join(' ').trim();
    if (filter) {
      searchParams.set('filter', filter);
    } else {
      searchParams.delete('filter');
    }
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  return (
    <div
      className={cx(
        'flex flex-col bg-[#f5f7f9] w-[320px] border-l border-[#cfd7df] overflow-y-auto',
        className
      )}
    >
      <div className="grow p-4">
        <div className="h-7 text-sm font-medium">过滤</div>

        <Field title="关键词">
          <Input
            autoFocus
            allowClear
            value={keyword}
            onChange={(e) => merge({ keyword: e.target.value ?? undefined })}
            onKeyDown={(e) => e.key === 'Enter' && handleChange()}
          />
        </Field>

        <Field title="请求者">
          <SearchUser
            allowClear
            className="w-full"
            value={requesterId}
            onChange={(requesterId) => merge({ requesterId })}
          />
        </Field>

        <Field title="负责人">
          <AssigneeSelect value={assigneeId} onChange={(assigneeId) => merge({ assigneeId })} />
        </Field>

        <Field title="创建时间">
          <CreatedAtSelect value={createdAt} onChange={(createdAt) => merge({ createdAt })} />
        </Field>

        <Field title="分类">
          <CategoryTreeSelect
            allowClear
            className="w-full"
            placeholder="任何"
            value={categoryId}
            onChange={(categoryId) => merge({ categoryId })}
          />
        </Field>

        <Field title="状态">
          <StatusSelect value={status} onChange={(status) => merge({ status })} />
        </Field>
      </div>

      <div className="sticky bottom-0 px-4 pb-2 bg-[#f5f7f9]">
        <div className="pt-4 border-t border-[#ebeff3]">
          <Button className="w-full" type="primary" disabled={!isDirty} onClick={handleChange}>
            应用
          </Button>
        </div>
      </div>
    </div>
  );
}
