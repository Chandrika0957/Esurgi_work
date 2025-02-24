import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/Register.js';
import ForgotPassword from './pages/ForgotPassword.js';
import Homepage from './pages/Homepage.js';
import PatientPage from './pages/PatientPage.js';
import LandingPage from './pages/LandingPage.js';
import ExercisePage from './pages/ExercisePage.js';
import CalendarPage from './pages/CalendarPage.js';
import BiostabilizerPage from './pages/BiostabilizerPage.js';
import MyAccountPage from './pages/MyAccountPage.js';
import SettingsPage from './pages/SettingsPage.js';
import AppoinmentPage from './pages/AppoinmentPage.js';
import CPT from './pages/CPT.js';
import Alert from './components/Alert.js';
import { RoleProvider } from './PatientContext.js'; 
import { Box } from '@mui/material';
import OneDriveCallback from './components/Authentication/OneDriveCallback.js'; 
import './App.css';

const App = () => {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Box
          sx={{
            backgroundColor: '#ffffff',
            color: "white",
            minHeight: "100vh",
          }}
        >
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/homepage' element={<Homepage />} />
            <Route path='/patients/:id' element={<PatientPage />} />
            <Route path='/exercises' element={<ExercisePage />} />
            <Route path='/calendar' element={<CalendarPage />} />
            <Route path='/biostabilizer' element={<BiostabilizerPage />} />
            <Route path='/my-account' element={<MyAccountPage />} />
            <Route path='/cpt' element={<CPT />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/appointment' element={<AppoinmentPage />} />
            <Route path="/auth/onedrive/callback" element={<OneDriveCallback />} />
          </Routes>
        </Box>
        <Alert />
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;
