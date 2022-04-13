import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UsePaginationOptions {
  defaultPageSize?: number;
}

export function usePagination({ defaultPageSize = 10 }: UsePaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageString = searchParams.get('page');
  const page = useMemo(() => {
    if (pageString) {
      const page = parseInt(pageString);
      if (!Number.isNaN(page) && page > 0) {
        return page;
      }
    }
    return 1;
  }, [pageString]);

  const pageSizeString = searchParams.get('pageSize');
  const pageSize = useMemo(() => {
    if (pageSizeString) {
      const pageSize = parseInt(pageSizeString);
      if (!Number.isNaN(pageSize) && pageSize > 0) {
        return pageSize;
      }
    }
    return defaultPageSize;
  }, [pageSizeString, defaultPageSize]);

  const setPage = useCallback(
    (page: number) => {
      if (page > 0) {
        if (page === 1) {
          searchParams.delete('page');
        } else {
          searchParams.set('page', page.toString());
        }
        setSearchParams(searchParams);
      }
    },
    [searchParams, setSearchParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (pageSize > 0) {
        searchParams.set('pageSize', pageSize.toString());
        setSearchParams(searchParams);
      }
    },
    [searchParams, setSearchParams]
  );

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const prevPage = useCallback(() => {
    setPage(page - 1);
  }, [page, setPage]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
  };
}
