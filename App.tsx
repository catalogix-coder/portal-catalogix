
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import Admin from './pages/Admin';
import { CourseProvider } from './context/CourseContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/course/:courseId" element={<CoursePlayer />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
