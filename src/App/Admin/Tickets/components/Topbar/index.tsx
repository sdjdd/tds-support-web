import { ComponentPropsWithoutRef, forwardRef, useEffect, useMemo, useState } from 'react';
import { BsLayoutSidebarReverse } from 'react-icons/bs';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import cx from 'classnames';

import { Checkbox } from '@/components/antd';
import { usePagination } from '@/utils/use-pagination';
import { SortDropdown } from './SortDropdown';

interface NavButtonProps extends ComponentPropsWithoutRef<'button'> {
  active?: boolean;
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(({ active, ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={cx(
        'border border-gray-300 rounded transition-colors text-gray-600 hover:bg-gray-200 disabled:hover:bg-transparent disabled:cursor-default disabled:opacity-40',
        {
          'shadow-inner bg-gray-200': active,
        },
        props.className
      )}
    />
  );
});

interface PaginationProps {
  className?: string;
  pageSize: number;
  count?: number;
  totalCount?: number;
  isLoading?: boolean;
}

function Pagination({ className, pageSize, count, totalCount, isLoading }: PaginationProps) {
  const { page, setPage } = usePagination();
  const [text, setText] = useState('');
  const [noMorePages, setNoMorePages] = useState(false);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (!isLoading && count !== undefined && totalCount !== undefined) {
      const starts = (page - 1) * pageSize;
      const ends = starts + count;
      if (count) {
        setText(`${starts + 1} - ${ends} / ${totalCount}`);
      } else {
        setText(`-- / ${totalCount}`);
      }
      setNoMorePages(ends === totalCount);
      setOverflow(ends > totalCount);
    }
  }, [page, pageSize, count, totalCount, isLoading]);

  return (
    <div className={cx('flex items-center', className)}>
      <span className="text-[#6f7c87]">{text || 'Loading...'}</span>
      <NavButton
        className="ml-2.5 px-[7px] py-[7px] rounded-r-none"
        disabled={isLoading || page === 1}
        onClick={() => (overflow ? setPage(1) : setPage(page - 1))}
      >
        <HiChevronLeft className="w-4 h-4" />
      </NavButton>
      <NavButton
        className="px-[7px] py-[7px] rounded-l-none"
        disabled={isLoading || noMorePages || overflow}
        onClick={() => setPage(page + 1)}
      >
        <HiChevronRight className="w-4 h-4" />
      </NavButton>
    </div>
  );
}

export interface TopbarProps extends ComponentPropsWithoutRef<'div'> {
  showFilter?: boolean;
  onChangeShowFilter?: (value: boolean) => void;
  pageSize: number;
  count?: number;
  totalCount?: number;
  isLoading?: boolean;
  checkedTicketIds?: number[];
  onCheckedChange: (checked: boolean) => void;
}

export function Topbar({
  showFilter,
  onChangeShowFilter,
  pageSize,
  count,
  totalCount,
  isLoading,
  checkedTicketIds,
  onCheckedChange,
  ...props
}: TopbarProps) {
  const indeterminate = useMemo(() => {
    if (checkedTicketIds !== undefined && count !== undefined) {
      if (checkedTicketIds.length > 0 && checkedTicketIds.length !== count) {
        return true;
      }
    }
    return false;
  }, [checkedTicketIds, count]);

  return (
    <div
      {...props}
      className={cx(
        'flex items-center h-14 bg-[#f4f7f9] px-4 border-b border-[#cfd7df] shadow-[0_2px_4px_0_rgba(24,50,71,0.08)]',
        props.className
      )}
    >
      <div className="flex grow items-center">
        <span className="mr-4">
          <Checkbox
            indeterminate={indeterminate}
            disabled={isLoading}
            checked={!!(checkedTicketIds && count && checkedTicketIds.length === count)}
            onChange={(e) => onCheckedChange(e.target.checked)}
          />
        </span>

        <SortDropdown disabled={isLoading} />
      </div>

      <Pagination
        className="ml-4"
        pageSize={pageSize}
        count={count}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      <NavButton
        className="ml-2 px-[7px] py-[7px]"
        active={showFilter}
        onClick={() => onChangeShowFilter?.(!showFilter)}
      >
        <BsLayoutSidebarReverse className="w-4 h-4" />
      </NavButton>
    </div>
  );
}
