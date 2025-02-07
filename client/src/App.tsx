import{
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import Home from './components/pages/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { useState } from 'react';
import { WalletProvider } from './context/WalletContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

function App() {
  return (
    <>
      <Header />
      <RouterProvider router={router} />
      <Footer />
    </>
  );
}

export default App;
