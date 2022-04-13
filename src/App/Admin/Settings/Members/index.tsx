import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useDebounce } from 'react-use';

import { UserSchema, useAgents, useSearchUsers, useUpdateUser } from '@/api/user';
import { Button, Modal, Select, Spin, Table, message } from '@/components/antd';

const { Column } = Table;

interface AddUserModalProps {
  visible: boolean;
  onHide: () => void;
}

function AddUserModal({ visible, onHide }: AddUserModalProps) {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useDebounce(() => setDebouncedKeyword(keyword), 500, [keyword]);

  const { data, isLoading } = useSearchUsers(debouncedKeyword, {
    enabled: !!debouncedKeyword,
  });

  const options = useMemo(
    () =>
      data?.map((user) => ({
        label: user.username,
        value: user.id,
        disabled: user.role !== 'end-user',
      })),
    [data]
  );

  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    setUserId(undefined);
  }, [visible]);

  const queryClient = useQueryClient();
  const { mutate, isLoading: updating } = useUpdateUser({
    onSuccess: () => {
      message.success('添加成功');
      queryClient.invalidateQueries('users');
      onHide();
    },
  });

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title="添加客服"
      onOk={() => mutate({ id: userId!, role: 'agent' })}
      confirmLoading={updating}
      okButtonProps={{ disabled: updating || !userId }}
      onCancel={() => onHide()}
      cancelButtonProps={{ disabled: updating }}
    >
      <Select
        className="w-full"
        showSearch
        autoFocus
        filterOption={false}
        onSearch={setKeyword}
        value={userId}
        onChange={setUserId}
        notFoundContent={isLoading ? <Spin size="small" /> : undefined}
        placeholder="使用用户名搜索"
        loading={isLoading}
        options={options}
      />
    </Modal>
  );
}

export function Members() {
  const { data: agents, isLoading: loadingAgents, refetch } = useAgents();

  const [addUserModalVisible, setAddUserModalVisible] = useState(false);

  const { mutateAsync } = useUpdateUser({
    onSuccess: () => {
      message.success('移除成功');
      refetch();
    },
  });

  const handleDelete = useCallback(
    (user: UserSchema) => {
      Modal.confirm({
        title: '移除客服',
        content: `是否将 ${user.username} 从客服中移除？`,
        okType: 'danger',
        onOk: () => mutateAsync({ id: user.id, role: 'end-user' }),
      });
    },
    [mutateAsync]
  );

  return (
    <div className="p-10">
      <h1 className="text-[#2f3941] text-[26px] font-normal">成员</h1>

      <div className="flex flex-row-reverse">
        <Button type="primary" onClick={() => setAddUserModalVisible(true)}>
          添加
        </Button>
      </div>

      <AddUserModal visible={addUserModalVisible} onHide={() => setAddUserModalVisible(false)} />

      <Table
        className="mt-5"
        rowKey="id"
        dataSource={agents}
        loading={loadingAgents}
        pagination={false}
      >
        <Column dataIndex="username" title="用户名" />
        <Column dataIndex="role" title="角色" />
        <Column
          key="actions"
          title="操作"
          render={(user: UserSchema) => (
            <div>
              <Button
                danger
                type="link"
                size="small"
                disabled={user.role === 'admin'}
                onClick={() => handleDelete(user)}
                style={{ padding: 0, border: 'none', height: 22 }}
              >
                移除
              </Button>
            </div>
          )}
        />
      </Table>
    </div>
  );
}
