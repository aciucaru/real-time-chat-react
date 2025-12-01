import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css'
import { AuthProvider } from './services/auth/AuthProvider';
import { NavBar } from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App()
{
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* No 'token' and 'setToken' props needed for the navigation bar, because it gets its
                ** required props from the React 'AuthContext' automatically. */}
                <NavBar></NavBar>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>  
    );
}

export default App
