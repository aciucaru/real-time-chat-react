import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css'
import { AuthProvider } from './services/auth/AuthProvider';
import { NavBar } from './components/NavBar';
import LoginPage from './pages/LoginPage';

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
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/items" element={<InventoryItemListPage />} />
                    <Route path="/add-item" element={<AddInventoryItemPage />} />
                    <Route path="/edit-item" element={<EditInventoryItemPage />} />
                    <Route path="/user-crud" element={<UserCrudPage />} />
                    <Route path="/inventory-item-crud" element={<InventoryItemCrudPage />} />
                    <Route path="/inventory-log-crud" element={<InventoryLogCrudPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>  
    );
}

export default App
