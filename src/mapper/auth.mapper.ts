import type { AuthResponseDTO } from "../models/dto/AuthResponseDTO";
import type { AuthResponse } from "../models/entity/AuthResponse";

export function toAuthResponse(dto: AuthResponseDTO): AuthResponse
{
    return {
        userId: dto.userId,
        username: dto.username,
        token: dto.token
    };
}