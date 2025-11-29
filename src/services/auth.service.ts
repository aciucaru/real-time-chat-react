import type { AuthResponseDTO } from "../dto/AuthResponseDTO";
import type { LoginRequestDTO } from "../dto/LoginRequestDTO";
import type { SignUpRequestDTO } from "../dto/SignUpRequestDTO";
import { toAuthResponse } from "../mapper/auth.mapper";

import axios from "axios";
import type { AuthResponse } from "../models/AuthResponse";


const BASE_URL = "api/auth";

export async function signUp(payload: SignUpRequestDTO): Promise<AuthResponseDTO>
{
    try
    {
        const { data } = await axios.post(`${BASE_URL}/signup`,
                                            payload,
                                        { headers: {"Content-Type": "application/json",}, });
        return toAuthResponse(data);
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Signup failed"); }
}

export async function login(payload: LoginRequestDTO): Promise<AuthResponse>
{
    try
    {
        const { data } = await axios.post(`${BASE_URL}/login`,
                                            payload,
                                        { headers: {"Content-Type": "application/json",}, });
        return toAuthResponse(data);
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Login failed"); }
}