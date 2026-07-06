import { useEffect, useState } from 'react';
import { DEV_MOBILE_LAYOUT } from '../lib/devMobileLayout';

/** ~40% smaller than previous sizes */
export function useWheelSize() {
  const [size, setSize] = useState(340);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setSize(DEV_MOBILE_LAYOUT ? Math.min(190, w - 32) : Math.min(200, w - 32));
      }
      else if (w < 1024) setSize(240);
      else if (w < 1440) setSize(300);
      else setSize(340);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}
