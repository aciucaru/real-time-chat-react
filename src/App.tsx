import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css'
import { AuthProvider } from './services/auth/AuthProvider';
import { NavBar } from './ui/components/NavBar';
import LoginPage from './ui/pages/LoginPage';
import RegisterPage from './ui/pages/RegisterPage';
import ChatPage from './ui/pages/ChatPage';
import { TopBar } from './ui/components/TopBar';
import { ChatProvider } from './services/web-socket/Chat-Provider';

function App()
{
    return (
        <AuthProvider>
            <ChatProvider>
                <BrowserRouter>
                    <NavBar></NavBar>
                    <TopBar></TopBar>
                    {/* No 'token' and 'setToken' props needed for the navigation bar, because it gets its
                    ** required props from the React 'AuthContext' automatically. */}
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                    </Routes>
                </BrowserRouter>
            </ChatProvider>
        </AuthProvider>  
    );
}

export default App
