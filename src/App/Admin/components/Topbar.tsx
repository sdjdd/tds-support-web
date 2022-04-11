import { ComponentPropsWithoutRef } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import cx from 'classnames';

import { Avatar } from '@/components/antd';

function CurrentUserSection(props: ComponentPropsWithoutRef<'section'>) {
  return (
    <section {...props}>
      <Avatar shape="square" size={32} icon={<AiOutlineUser className="w-8 h-8" />} />
    </section>
  );
}

export function Topbar(props: ComponentPropsWithoutRef<'header'>) {
  return (
    <header
      {...props}
      className={cx('flex items-center h-16 border-b px-4 bg-white', props.className)}
    >
      <section id="custom-section" className="grow"></section>
      <CurrentUserSection className="shrink-0" />
    </header>
  );
}
