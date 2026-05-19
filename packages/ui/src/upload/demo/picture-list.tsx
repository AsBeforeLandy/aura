import React, { useState } from 'react';
import { Upload } from '@aura/ui';

const Demo: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);

  return <Upload listType="picture" onChange={setFileList} />;
};

export default Demo;
