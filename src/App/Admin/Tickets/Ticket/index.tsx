import { ComponentPropsWithoutRef, ReactNode, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { AiOutlineHistory, AiOutlineUser } from 'react-icons/ai';
import cx from 'classnames';
import moment from 'moment';
import { uniq } from 'lodash-es';

import { useTicket, useReplies, useCreateReply, ReplySchema, useUpdateTicket } from '@/api/ticket';
import { useAgents, useManyUsers, UserSchema } from '@/api/user';
import { Avatar, Button, Input, Select, Spin } from '@/components/antd';
import { useCurrentUser } from '@/App/states';
import { CategoryTreeSelect } from '@/App/Admin/Settings/Categories/CategoryTreeSelect';

const { TextArea } = Input;
const { Option } = Select;

function IconButton(props: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      {...props}
      className={cx(
        'w-8 h-8 flex justify-center items-center text-[#68737d] hover:bg-[#1f73b714] rounded transition-colors duration-200',
        props.className
      )}
    >
      {props.children}
    </button>
  );
}

interface ReplyContentProps {
  author?: UserSchema;
  createdAt?: string;
  internal?: boolean;
  content: ReactNode;
}

function ReplyContent({ author, createdAt, content, internal }: ReplyContentProps) {
  return (
    <div className="flex px-5 py-4">
      <div className="shrink-0">
        <Avatar shape="circle" size={40} icon={<AiOutlineUser className="w-10 h-10" />} />
      </div>

      <div className="grow ml-4 overflow-hidden">
        <div className="flex justify-between">
          <div className="flex items-center overflow-hidden">
            <div className="text-[#2f3941] font-semibold truncate">
              {author?.username ?? 'Loading'}
            </div>
            {internal && (
              <div className="bg-[#ffb057] text-[#703815] text-xs h-4 px-1 rounded shrink-0 font-semibold ml-2">
                内部
              </div>
            )}
          </div>
          {createdAt && (
            <div
              className="ml-2 shrink-0 text-sm text-[#68737d] leading-[22px]"
              title={moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}
            >
              {moment(createdAt).fromNow()}
            </div>
          )}
        </div>

        <div
          className={cx('mt-2 rounded', {
            'p-4 bg-[#fff8ed] border border-[#fcdba9]': internal,
          })}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

function useManyUsersWithCache(ids: number[] | undefined) {
  const $userById = useRef<Record<number, UserSchema>>({});
  const missingIds = useMemo(() => {
    if (!ids || ids.length === 0) {
      return undefined;
    }
    const userById = $userById.current;
    return ids.filter((id) => !userById[id]);
  }, [ids]);

  const { isLoading } = useManyUsers(missingIds!, {
    enabled: missingIds !== undefined && missingIds.length > 0,
    onSuccess: (users) => {
      const userById = $userById.current;
      users.forEach((user) => (userById[user.id] = user));
    },
  });

  return { isLoading, data: $userById.current };
}

interface AssigneeSelectProps {
  value?: number;
  disabled?: boolean;
  onChange: (value: number | null) => void;
}

function AssigneeSelect({ value, disabled, onChange }: AssigneeSelectProps) {
  const currentUser = useCurrentUser();
  const { data, isLoading } = useAgents();

  const options = useMemo(() => {
    return [
      { label: '(未分配)', value: null },
      ...(data ?? []).map((a) => ({ label: a.username, value: a.id })),
    ];
  }, [data]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">负责人</span>
        <Button
          type="link"
          size="small"
          disabled={(value !== undefined && value === currentUser!.id) || disabled}
          onClick={() => onChange(currentUser!.id)}
          style={{ fontSize: 12, padding: 0 }}
        >
          分配给我
        </Button>
      </div>
      <Select
        className="w-full"
        showSearch
        loading={isLoading}
        disabled={disabled}
        options={options}
        optionFilterProp="label"
        value={value ?? null}
        onChange={onChange}
      />
    </div>
  );
}

export function Ticket() {
  const { id } = useParams<'id'>();

  const { data: ticket, isLoading: loadingTicket } = useTicket(id!);

  const { data: replies } = useReplies(id!);

  const userIds = useMemo(() => {
    if (ticket && replies) {
      const ids = [ticket.requesterId].concat(replies.map((r) => r.authorId));
      if (ticket.assigneeId) {
        ids.push(ticket.assigneeId);
      }
      return uniq(ids);
    }
  }, [ticket, replies]);

  const { data: userById, isLoading: loadingUsers } = useManyUsersWithCache(userIds);

  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState('');

  const $replyContainer = useRef<HTMLDivElement>(null!);

  const queryClient = useQueryClient();

  const { mutate: sendReply, isLoading: sending } = useCreateReply({
    onSuccess: (reply) => {
      setContent('');
      queryClient.setQueryData<ReplySchema[] | undefined>(['replies', id!], (data) => {
        return data && [...data, reply];
      });
      setTimeout(() => {
        $replyContainer.current.scrollTop = $replyContainer.current.scrollHeight;
      }, 500);
    },
  });

  const { mutate: update, isLoading: updating } = useUpdateTicket({
    onSuccess: (ticket) => {
      queryClient.setQueryData(['ticket', id!], ticket);
    },
  });

  if (loadingTicket || loadingUsers) {
    return (
      <div className="h-full flex justify-center items-center bg-white">
        <Spin />
      </div>
    );
  }

  if (!ticket) {
    return <Navigate to=".." />;
  }

  return (
    <div className="grid grid-rows-[1fr_50px] h-full bg-white">
      <div className="grid grid-cols-[308px_1fr_48px] overflow-hidden">
        <div className="border-r border-[#d8dcde] p-5">
          <AssigneeSelect
            value={ticket.assigneeId}
            disabled={updating}
            onChange={(assigneeId) => update({ ticketId: id!, assigneeId })}
          />

          <div className="mt-4">
            <div className="text-sm font-semibold mb-1">分类</div>
            <CategoryTreeSelect
              className="w-full"
              value={ticket.categoryId}
              treeDefaultExpandedKeys={[ticket.categoryId]}
              disabled={updating}
              onChange={(categoryId) => categoryId && update({ ticketId: id!, categoryId })}
            />
          </div>
        </div>

        <div className="grid grid-rows-[48px_1fr_auto] overflow-hidden">
          <div className="flex items-center border-b border-[#d8dcde] px-5 overflow-hidden">
            <div
              className="grow text-[16px] text-[#2f3941] truncate overflow-hidden"
              title={ticket.title}
            >
              {ticket.title}
            </div>

            <div className="shrink-0">
              <IconButton>
                <AiOutlineHistory className="w-[18px] h-[18px]" />
              </IconButton>
            </div>
          </div>

          <div ref={$replyContainer} className="overflow-auto">
            <ReplyContent
              author={userById[ticket.requesterId]}
              createdAt={ticket.createdAt}
              content={
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: ticket.htmlContent }}
                />
              }
            />

            {replies?.map((reply) => (
              <ReplyContent
                key={reply.id}
                author={userById[reply.authorId]}
                createdAt={reply.createdAt}
                internal={!reply.public}
                content={
                  <div
                    className="markdown-body bg-transparent"
                    dangerouslySetInnerHTML={{ __html: reply.htmlContent }}
                  />
                }
              />
            ))}
          </div>

          <div className="border-t border-[#d8dcde] p-1">
            <Select value={isPublic} onChange={setIsPublic} style={{ width: 200 }}>
              <Option value={true}>公开回复</Option>
              <Option value={false}>内部注释</Option>
            </Select>
            <div className="mt-1">
              <TextArea
                autoFocus
                autoSize={{ minRows: 5, maxRows: 10 }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={sending}
                style={{ backgroundColor: isPublic ? undefined : '#fff8ed' }}
              />
            </div>
          </div>
        </div>

        <div className="p-2 border-l border-[#d8dcde]">
          <IconButton>
            <AiOutlineUser className="w-[18px] h-[18px]" />
          </IconButton>
        </div>
      </div>

      <div className="flex items-center border-t border-[#d8dcde] px-[10px]">
        <div className="grow"></div>
        <Button
          type="primary"
          disabled={!content}
          loading={sending}
          onClick={() => sendReply({ ticketId: ticket.id, public: isPublic, content })}
        >
          提交
        </Button>
      </div>
    </div>
  );
}
