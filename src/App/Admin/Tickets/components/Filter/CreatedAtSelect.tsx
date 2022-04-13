import { useMemo } from 'react';
import moment, { Moment } from 'moment';

import { DatePicker, Select } from '@/components/antd';

const { RangePicker } = DatePicker;

const options = [
  { value: 'all', label: '所有时间' },
  { value: 'eq', label: '选择日期' },
  { value: 'gt', label: '在此日期之后' },
  { value: 'lt', label: '在此日期之前' },
  { value: 'range', label: '在此日期之间' },
];

export type CreatedAtValue =
  | {
      type: 'all';
    }
  | {
      type: 'eq' | 'gt' | 'lt';
      value?: string;
    }
  | {
      type: 'range';
      value?: [string, string];
    };

export interface CreatedAtSelectProps {
  value?: CreatedAtValue;
  onChange: (value: CreatedAtValue | undefined) => void;
}

export function CreatedAtSelect({ value, onChange }: CreatedAtSelectProps) {
  const dateValue = useMemo(() => {
    if (value) {
      switch (value.type) {
        case 'eq':
        case 'gt':
        case 'lt':
          return value.value && moment(value.value);
        case 'range':
          return value.value && value.value.map((t) => moment(t));
      }
    }
  }, [value]);

  return (
    <>
      <Select
        className="w-full"
        options={options}
        value={value?.type ?? 'all'}
        onChange={(type) => onChange({ type })}
      />
      {value !== undefined && (
        <>
          {(value.type === 'eq' || value.type === 'gt' || value.type === 'lt') && (
            <div className="mt-2">
              <DatePicker
                className="w-full"
                value={dateValue as Moment}
                onChange={(_, str) => {
                  onChange({
                    type: value.type,
                    value: str || undefined,
                  });
                }}
              />
            </div>
          )}
          {value.type === 'range' && (
            <div className="mt-2">
              <RangePicker
                className="w-full"
                value={dateValue as [Moment, Moment]}
                onChange={(range, str) => {
                  onChange({
                    type: value.type,
                    value: range ? str : undefined,
                  });
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
