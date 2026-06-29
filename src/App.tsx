import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { AppProvider } from './context/AppProvider';
import { UserProvider } from './context/UserProvider';

// Lazy load pages
import React, { Suspense } from 'react';
import { Skeleton } from './components/ui/Skeleton';

const Home = React.lazy(() => import('./pages/Home'));
const MovieDetail = React.lazy(() => import('./pages/MovieDetail'));
const TVDetail = React.lazy(() => import('./pages/TVDetail'));
const Search = React.lazy(() => import('./pages/Search'));
const Discover = React.lazy(() => import('./pages/Discover'));
const Compare = React.lazy(() => import('./pages/Compare'));
const PersonDetail = React.lazy(() => import('./pages/PersonDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));

const PageLoader = () => (
  <div className='container py-10 px-4 space-y-8'>
    <Skeleton className='h-[400px] w-full' />
    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6'>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className='h-[300px] w-full' />
      ))}
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <UserProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route index element={<Home />} />
                <Route path='movies' element={<Discover type='movie' />} />
                <Route path='tv' element={<Discover type='tv' />} />
                <Route path='movie/:id' element={<MovieDetail />} />
                <Route path='tv/:id' element={<TVDetail />} />
                <Route path='person/:id' element={<PersonDetail />} />
                <Route path='search' element={<Search />} />
                <Route path='discover' element={<Discover />} />
                <Route path='compare' element={<Compare />} />
                <Route path='profile' element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </AppProvider>
  );
}

export default App;
