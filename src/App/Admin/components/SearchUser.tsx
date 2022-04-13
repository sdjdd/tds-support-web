import { forwardRef, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { RefSelectProps } from 'antd/lib/select';

import { useSearchUsers, useUser } from '@/api/user';
import { Select, SelectProps, Spin, message } from '@/components/antd';

export interface SearchUserProps extends SelectProps<number> {}

export const SearchUser = forwardRef<RefSelectProps, SearchUserProps>((props, ref) => {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useDebounce(() => setDebouncedKeyword(keyword), 500, [keyword]);

  const { data: user, isLoading: loadingUser } = useUser(props.value!, {
    enabled: props.value !== undefined,
    onError: (error) => {
      console.log(error);
      message.error(error.message);
    },
  });

  const { data: users, isLoading: loadingUsers } = useSearchUsers(debouncedKeyword, {
    enabled: !!debouncedKeyword,
    staleTime: Infinity,
    onError: (error) => {
      console.log(error);
      message.error(error.message);
    },
  });

  const options = useMemo(() => {
    return (users ?? (user ? [user] : [])).map((user) => ({
      label: user.username,
      value: user.id,
    }));
  }, [users, user]);

  const isLoading = loadingUser || loadingUsers;

  return (
    <Select
      notFoundContent={isLoading ? <Spin size="small" /> : debouncedKeyword ? undefined : null}
      placeholder="使用用户名搜索"
      {...props}
      showSearch
      ref={ref}
      filterOption={false}
      onSearch={setKeyword}
      loading={isLoading}
      options={options}
    />
  );
});
