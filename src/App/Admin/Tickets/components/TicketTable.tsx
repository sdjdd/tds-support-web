import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { keyBy, uniq } from 'lodash-es';

import { useManyUsers } from '@/api/user';
import { TicketSchema } from '@/api/ticket';
import { Checkbox, Table } from '@/components/antd';
import { TicketStatus } from './TicketStatus';
import { CategoryPath, CategoryProvider } from './Category';

const { Column } = Table;

function TicketLink({ ticket }: { ticket: TicketSchema }) {
  return (
    <Link className="flex font-bold max-w-[400px]" title={ticket.title} to={ticket.id.toString()}>
      <span className="truncate">{ticket.title}</span>
      <span className="shrink-0 ml-1 text-[#6f7c87]">#{ticket.id}</span>
    </Link>
  );
}

export interface TicketTableProps {
  loading?: boolean;
  tickets?: TicketSchema[];
  checkedIds: number[];
  onChangeChecked: (id: number, checked: boolean) => void;
}

export function TicketTable({ loading, tickets, checkedIds, onChangeChecked }: TicketTableProps) {
  const checkedIdSet = useMemo(() => new Set(checkedIds), [checkedIds]);

  const requesterIds = useMemo(() => {
    if (tickets) {
      return tickets.map((t) => t.requesterId);
    }
    return [];
  }, [tickets]);

  const assigneeIds = useMemo(() => {
    if (tickets) {
      return tickets.reduce<number[]>((ids, ticket) => {
        if (ticket.assigneeId) {
          ids.push(ticket.assigneeId);
        }
        return ids;
      }, []);
    }
    return [];
  }, [tickets]);

  const userIds = useMemo(
    () => uniq(requesterIds.concat(assigneeIds)),
    [requesterIds, assigneeIds]
  );

  const { data: users, isLoading: loadingUsers } = useManyUsers(userIds, {
    enabled: userIds.length > 0,
  });

  const userById = useMemo(() => keyBy(users, 'id'), [users]);

  // const getCategoryPath = useGetCategoryPath();

  return (
    <CategoryProvider>
      <Table
        className="min-w-[1000px]"
        rowKey="id"
        loading={loading}
        dataSource={tickets}
        pagination={false}
      >
        <Column
          dataIndex="id"
          width={42}
          render={(id: number) => (
            <Checkbox
              checked={checkedIdSet.has(id)}
              onChange={(e) => onChangeChecked(id, e.target.checked)}
            />
          )}
        />

        <Column
          dataIndex="status"
          title="状态"
          render={(status: number) => <TicketStatus status={status} />}
        />

        <Column
          key="title"
          title="标题"
          render={(ticket: TicketSchema) => <TicketLink ticket={ticket} />}
        />

        <Column
          dataIndex="categoryId"
          title="分类"
          render={(categoryId: number) => (
            <CategoryPath className="whitespace-nowrap text-sm" categoryId={categoryId} />
          )}
        />

        <Column
          dataIndex="requesterId"
          title="请求者"
          render={(id: number) => (loadingUsers ? 'Loading' : userById[id]?.username ?? 'unknown')}
        />

        <Column
          dataIndex="assigneeId"
          title="负责人"
          render={(assigneeId?: string) =>
            assigneeId
              ? loadingUsers
                ? 'Loading...'
                : userById[assigneeId]?.username ?? 'unknown'
              : '-'
          }
        />

        <Column
          title="创建时间"
          dataIndex="createdAt"
          render={(data: string) => (
            <span title={new Date(data).toLocaleString()}>{moment(data).fromNow()}</span>
          )}
        />
      </Table>
    </CategoryProvider>
  );
}
