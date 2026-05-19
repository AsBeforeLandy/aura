import React, { useState } from 'react';
import { Upload } from '@aura/ui';

const Demo: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);

  return <Upload listType="text" onChange={setFileList} />;
};

export default Demo;
