import React from 'react';
import { useOutlet, usePrefersColor } from 'dumi';

const GlobalLayout: React.FC = () => {
  const outlet = useOutlet();
  const [color] = usePrefersColor();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', color || 'light');
  }, [color]);

  return <>{outlet}</>;
};

export default GlobalLayout;
