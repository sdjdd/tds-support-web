import { Route, Routes } from 'react-router-dom';

import { SubMenu, MenuDataItem } from '@/components/Page';

import { Members } from './Members';
import { CategoryList, NewCategory, CategoryDetail } from './Categories';

const SettingRoutes = () => (
  <Routes>
    <Route path="/members" element={<Members />} />
    <Route path="/categories">
      <Route index element={<CategoryList />} />
      <Route path="new" element={<NewCategory />} />
      <Route path=":id" element={<CategoryDetail />} />
    </Route>
  </Routes>
);

const routeGroups: MenuDataItem[] = [
  {
    name: '客服设置',
    key: 'customerService',
    children: [
      {
        name: '成员',
        path: 'members',
      },
      {
        name: '客服组',
        path: 'groups',
      },
      {
        name: '请假',
        path: 'vacations',
      },
    ],
  },
  {
    name: '管理',
    key: 'manage',
    children: [
      {
        name: '分类',
        path: 'categories',
      },
      {
        name: '标签',
        path: 'tags',
      },
      {
        name: '快捷回复',
        path: 'quick-replies',
      },
      {
        name: '视图',
        path: 'views',
      },
      {
        name: '工单字段',
        path: 'ticket-fields',
      },
      {
        name: '工单表单',
        path: 'ticket-forms',
      },
      {
        name: '动态内容',
        path: 'dynamic-contents',
      },
    ],
  },
  {
    name: '知识库',
    key: 'knowledge-base',
    children: [
      {
        name: '文章',
        path: 'articles',
      },
    ],
  },
  {
    name: '业务规则',
    key: 'rule',
    children: [
      {
        name: '流转触发器',
        path: 'triggers',
      },
      {
        name: '定时触发器',
        path: 'time-triggers',
      },
    ],
  },
  {
    name: '其他设置',
    key: 'other',
    children: [
      {
        name: '工作时间',
        path: 'weekday',
      },
    ],
  },
];

export default function Setting() {
  return (
    <SubMenu menus={routeGroups}>
      <SettingRoutes />
    </SubMenu>
  );
}
