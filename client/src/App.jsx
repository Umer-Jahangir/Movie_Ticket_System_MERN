import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/home.jsx';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favorite from './pages/Favorite';
import Footer from './components/Footer';
import TrailerSection from './components/TrailerSection.jsx'; 
import { Toaster } from 'react-hot-toast';
import Layout from './pages/admin/Layout';
import ListShows from './pages/admin/ListShows';
import AddShows from './pages/admin/AddShows';
import ListBookings from './pages/admin/ListBookings.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import { useAppContext } from './context/AppContext.jsx';
import { SignIn } from '@clerk/clerk-react';
import Loading from './components/Loading.jsx';

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const {user} = useAppContext()
  return (
      <>
        <Toaster/>
        {!isAdminRoute && <Navbar />}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path = '/movies' element={<Movies />} />
          <Route path = '/movies/:id' element={<MovieDetails />} />
          <Route path = '/movies/:id/:date' element={<SeatLayout />} />
          <Route path = '/my-bookings' element={<MyBookings />} />
          <Route path = '/loading/:nextUrl' element={<Loading />} />
          <Route path = '/Favorite' element={<Favorite />} />
          <Route path = '/Trailer' element = {<TrailerSection/>} />
            <Route path = '/admin/*' element={user ? <Layout/> : (
              <div>
                <SignIn fallbackRedirectUrl={'/admin'}/>
              </div>
            )}>
              <Route index element={<Dashboard />} />
              <Route path='add-shows' element={<AddShows />} />
              <Route path='list-shows' element={<ListShows />} />
              <Route path = 'list-bookings' element={<ListBookings />} />
            </Route>
          </Routes>
        {!isAdminRoute && <Footer />}
      </>
  );
};

export default App;
