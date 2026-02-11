import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Tasks from './pages/Tasks';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import Lobby from './pages/Lobby';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLobby = location.pathname === '/lobby';

  return (
    <>
      <div className="relative z-10 w-full min-h-screen">
        <Navbar minimal={isLandingPage || isLobby} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/lobby" 
            element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/sessions" 
            element={
              <PrivateRoute>
                <Sessions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } 
          />
           <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
