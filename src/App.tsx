// import { lazy, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

// import './App.less';
import { routes } from './router';

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
