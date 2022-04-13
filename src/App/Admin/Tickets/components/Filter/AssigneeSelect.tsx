import { useMemo } from 'react';

import { useAgents } from '@/api/user';
import { Select } from '@/components/antd';

export interface AssigneeSelectProps {
  value?: (number | string)[];
  onChange: (value: (number | string)[] | undefined) => void;
}

export function AssigneeSelect({ value, onChange }: AssigneeSelectProps) {
  const { data: agents, isLoading } = useAgents();

  const options = useMemo(() => {
    return [
      { label: '未指派', value: 'none' },
      ...(agents ?? []).map((a) => ({ label: a.username, value: a.id })),
    ];
  }, [agents]);

  return (
    <Select
      className="w-full"
      mode="multiple"
      showArrow
      placeholder={isLoading ? 'Loading...' : '任何'}
      loading={isLoading}
      options={options}
      optionFilterProp="label"
      value={value}
      onChange={(v) => onChange(v.length ? v : undefined)}
    />
  );
}
