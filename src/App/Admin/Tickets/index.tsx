import { useSearchTickets } from '@/api/ticket';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import { usePagination } from '@/utils/use-pagination';
import { Topbar } from './components/Topbar';
import { FilterForm } from './components/Filter';
import { TicketTable } from './components/TicketTable';

const PAGE_SIZE = 20;

function TicketList() {
  const { page } = usePagination();
  const [searchParams] = useSearchParams();
  const [showFilterForm, setShowFilterForm] = useState(false);

  const { data, isLoading, isFetching } = useSearchTickets({
    filter: searchParams.get('filter') ?? undefined,
    page,
    pageSize: PAGE_SIZE,
    orderBy: searchParams.get('orderBy') ?? '-createdAt',
    queryOptions: {
      keepPreviousData: true,
    },
  });

  const tickets = data?.tickets;
  const totalCount = data?.count;

  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  useEffect(() => setCheckedIds([]), [tickets]);

  const handleCheckTicket = useCallback((id: number, checked: boolean) => {
    if (checked) {
      setCheckedIds((prev) => [...prev, id]);
    } else {
      setCheckedIds((prev) => prev.filter((_id) => _id !== id));
    }
  }, []);

  const handleCheckAll = useCallback(
    (checked: boolean) => {
      if (tickets) {
        if (checked) {
          setCheckedIds(tickets.map((t) => t.id));
        } else {
          setCheckedIds([]);
        }
      }
    },
    [tickets]
  );

  return (
    <div className="grid grid-rows-[56px_1fr] h-full">
      <Topbar
        className="shrink-0 z-10"
        showFilter={showFilterForm}
        onChangeShowFilter={setShowFilterForm}
        pageSize={PAGE_SIZE}
        count={tickets?.length}
        totalCount={totalCount}
        isLoading={isFetching}
        checkedTicketIds={checkedIds}
        onCheckedChange={handleCheckAll}
      />

      <div className="flex h-full overflow-hidden">
        <div className="grow h-full p-[10px] overflow-auto">
          <TicketTable
            loading={isLoading}
            tickets={tickets}
            checkedIds={checkedIds}
            onChangeChecked={handleCheckTicket}
          />
        </div>

        {showFilterForm && (
          <FilterForm className="shrink-0" filters={data?.filter} onChange={() => {}} />
        )}
      </div>
    </div>
  );
}

export default function Tickets() {
  return (
    <Routes>
      <Route index element={<TicketList />} />
    </Routes>
  );
}
