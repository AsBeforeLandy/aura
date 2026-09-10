import React from 'react';
import { message } from 'antd';
import { SearchForm, BusinessProvider } from '@aura/business';

const Demo: React.FC = () => (
  <BusinessProvider>
    <SearchForm
      fields={[
        {
          name: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '用户名 / 手机号',
        },
        {
          name: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '启用', value: 'active' },
            { label: '禁用', value: 'disabled' },
          ],
        },
        {
          name: 'role',
          label: '角色',
          type: 'select',
          options: [
            { label: '管理员', value: 'admin' },
            { label: '普通用户', value: 'user' },
          ],
        },
        { name: 'createdAt', label: '创建时间', type: 'dateRange' },
        { name: 'age', label: '年龄', type: 'number', placeholder: '请输入' },
      ]}
      onSearch={(values) => {
        message.info(`查询条件：${JSON.stringify(values)}`);
      }}
      onReset={() => {
        message.info('已重置');
      }}
    />
  </BusinessProvider>
);

export default Demo;
