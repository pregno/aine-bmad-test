import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './components/HomePage';

const AboutPage = lazy(() => import('./components/AboutPage'));

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
