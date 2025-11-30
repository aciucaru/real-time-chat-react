// src/services/axiosPublicClient.ts
import axios from "axios";
import { authState } from "./auth-state";

const BASE_URL = "";
const API_URL = BASE_URL + ":8080/payara.example-0.1-SNAPSHOT/resources";

export const axiosPublicClient = axios.create({
                                            baseURL: import.meta.env.VITE_API_URL,
                                            headers: { "Content-Type": "application/json" },
                                        });

export const axiosAuthClient = axios.create({
                                            baseURL: import.meta.env.VITE_API_URL,
                                            headers: { "Content-Type": "application/json" },
                                        });

// Attach latest access token dynamically
axiosAuthClient.interceptors.request.use((config) =>
{
    const token = authState.getToken();
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    
    return config;
});