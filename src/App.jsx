import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
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
import CourseUpload from './pages/CourseUpload';
import StudyPlanner from './pages/StudyPlanner';
import StudySession from './pages/StudySession';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Calendar from './pages/Calendar';

function App() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isLandingPage = location.pathname === '/';
  const isLobby = location.pathname === '/lobby';

  // Show full navbar on landing page if user is logged in
  const minimalNav = (isLandingPage || isLobby) && !user;

  return (
    <>
      <div className="relative z-10 w-full min-h-screen pt-20">
        <Navbar minimal={minimalNav} />
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
          <Route 
            path="/subjects" 
            element={
              <PrivateRoute>
                <Subjects />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/subjects/:subjectId" 
            element={
              <PrivateRoute>
                <SubjectDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upload-course" 
            element={
              <PrivateRoute>
                <CourseUpload />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/planner" 
            element={
              <StudyPlanner />
            } 
          />
          <Route 
            path="/study-session" 
            element={
              <PrivateRoute>
                <StudySession />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
