import type { AuthResponseDTO } from "../dto/AuthResponseDTO";
import type { AuthResponse } from "../models/AuthResponse";

export function toAuthResponse(dto: AuthResponseDTO): AuthResponse
{
    return {
        userId: dto.userId,
        username: dto.username,
        token: dto.token
    };
}