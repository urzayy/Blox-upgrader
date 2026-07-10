import { lazy, Suspense } from 'react';
import ProdApp from './ProdApp';

const DevApp = lazy(() => import('./DevApp'));

export default function App() {
  if (import.meta.env.DEV) {
    return (
      <Suspense fallback={null}>
        <DevApp />
      </Suspense>
    );
  }
  return <ProdApp />;
}
