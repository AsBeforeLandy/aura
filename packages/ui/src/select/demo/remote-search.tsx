import React, { useState } from 'react';
import { Select } from '@aura-react-comp/ui';

interface UserOption {
  label: string;
  value: number;
}

const ALL_USERS: UserOption[] = [
  { label: '张三', value: 1 },
  { label: '李四', value: 2 },
  { label: '王五', value: 3 },
];

/** filterOption={false} 关闭本地过滤，onSearch 里做远程搜索（此处用 setTimeout 模拟）。 */
export default () => {
  const [options, setOptions] = useState<UserOption[]>(ALL_USERS);

  const handleSearch = (keyword: string) => {
    // 模拟远程搜索：实际项目中在这里请求接口
    setTimeout(() => {
      setOptions(
        ALL_USERS.filter((u) => u.label.includes(keyword)),
      );
    }, 200);
  };

  return (
    <Select
      searchable
      filterOption={false}
      loading={false}
      onSearch={handleSearch}
      placeholder="输入姓名远程搜索"
      options={options}
    />
  );
};
