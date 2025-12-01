import type { LoginRequestDTO } from "../../models/dto/LoginRequestDTO";
import type { SignUpRequestDTO } from "../../models/dto/SignUpRequestDTO";
import { toAuthResponse } from "../../models/mapper/auth.mapper";

import axios from "axios";
import type { AuthResponse } from "../../models/entity/AuthResponse";
import { axiosPublicClient } from "../auth/axios-clients";
import type { AuthResponseDTO } from "../../models/dto/AuthResponseDTO";


const BASE_URL = "/auth";

// POST api/auth/signup
// Create a new user
export async function signUp(payload: SignUpRequestDTO): Promise<AuthResponse>
{
    const response = await axiosPublicClient.post<AuthResponseDTO>(`${BASE_URL}/register`,
                                                    payload,
                                                    { headers: {"Content-Type": "application/json",}, }
                                                );

    // Convert from AuthResponseDTO to AuthResponse
    return toAuthResponse(response.data);
}

// POST /api/auth/login
// Authenticate and return a JWT/session token.
export async function login(payload: LoginRequestDTO): Promise<AuthResponse>
{
    const response = await axiosPublicClient.post<AuthResponseDTO>(`${BASE_URL}/login`,
                                payload,
                                { headers:
                                    {"Content-Type": "application/json",},
                                    // ensures refresh token cookie is sent
                                    withCredentials: true, 
                                });
                                
    // Convert from AuthResponseDTO to AuthResponse
    return toAuthResponse(response.data);
}