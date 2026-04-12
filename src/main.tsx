import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Pages (will be added in later sprints)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const GameSetupPage = React.lazy(() => import('./pages/GameSetupPage'));
const GameRoundPage = React.lazy(() => import('./pages/GameRoundPage'));
const WinnerPage = React.lazy(() => import('./pages/WinnerPage'));
const PlayerPage = React.lazy(() => import('./pages/PlayerPage'));

const router = createBrowserRouter([
  { path: '/', element: <React.Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Carregando...</div>}><HomePage /></React.Suspense> },
  { path: '/game/setup', element: <React.Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Carregando...</div>}><GameSetupPage /></React.Suspense> },
  { path: '/game/round', element: <React.Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Carregando...</div>}><GameRoundPage /></React.Suspense> },
  { path: '/game/winner', element: <React.Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Carregando...</div>}><WinnerPage /></React.Suspense> },
  { path: '/player', element: <React.Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Carregando...</div>}><PlayerPage /></React.Suspense> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
