// src/services/axiosPublicClient.ts
import axios from "axios";
import { getToken } from "./token-storage";

const BASE_URL = "";

// Public axios client
export const axiosPublicClient = axios.create({
                                            baseURL: import.meta.env.VITE_API_URL,
                                            headers: { "Content-Type": "application/json" },
                                        });


// Axios client for authenticated requests.
// This client will require a token to send with the request, but we do not store the token
// inside the axios client directly, because that would be just the first version of the token.
export const axiosAuthClient = axios.create({
                                            baseURL: import.meta.env.VITE_API_URL,
                                            headers: { "Content-Type": "application/json" },
                                        });

// To make sure the axios client always gets the most recent token, we do not pass the token directly
// to the axios client, but instead we use an interceptor.
// This makes sure that, before every request, the axios client gets the most recent token.
// This also works after logout, because the last token will be old/invalid and request will fail, as expected.
axiosAuthClient.interceptors.request.use((config) =>
{
    const token = getToken();

    // The 'config' object is an axios request configuration object.
    // We use its 'headers' property, which also contains 'Authorization'.
    // 'Authorization' is the standard HTTP header used by all servers to receive JWT
    if (token)
        // Set the token on the HTTP headers, so that it's sent with the request
        config.headers.Authorization = `Bearer ${token}`;
    else
        // Delete the token if it's null
        delete config.headers.Authorization;
    
    return config;
});