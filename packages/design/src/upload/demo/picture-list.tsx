import React, { useState } from 'react';
import { Upload } from '@aura-react-comp/design';

const Demo: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);

  return <Upload listType="picture" onChange={setFileList} />;
};

export default Demo;
