import type { UserLogintDto } from "../../models/dto/UserLoginDto";
import type { UserRegisterDto } from "../../models/dto/UserRegisterDto";
import { toAuthResponse } from "../../models/mapper/auth.mapper";

import type { AuthResponse } from "../../models/entity/AuthResponse";
import { axiosPublicClient } from "../auth/axios-clients";
import type { AuthResponseDto } from "../../models/dto/AuthResponseDto";


const BASE_URL = "http://localhost:8080/auth";

// POST /auth/signup
// Create a new user
export async function register(payload: UserRegisterDto): Promise<AuthResponse>
{
    const response = await axiosPublicClient.post<AuthResponseDto>(`${BASE_URL}/register`,
                                                    payload,
                                                    { headers: {"Content-Type": "application/json",}, }
                                                );

    // Convert from AuthResponseDTO to AuthResponse
    return toAuthResponse(response.data);
}

// POST /api/auth/login
// Authenticate and return a JWT/session token.
export async function login(payload: UserLogintDto): Promise<AuthResponse>
{
    const response = await axiosPublicClient.post<AuthResponseDto>(`${BASE_URL}/login`,
                                payload,
                                { headers:
                                    {"Content-Type": "application/json",},
                                    // ensures refresh token cookie is sent
                                    withCredentials: true, 
                                });
                                
    // Convert from AuthResponseDTO to AuthResponse
    return toAuthResponse(response.data);
}