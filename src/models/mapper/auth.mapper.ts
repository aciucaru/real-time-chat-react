import type { AuthResponseDto } from "../dto/AuthResponseDto";
import type { AuthResponse } from "../entity/AuthResponse";

export function toAuthResponse(dto: AuthResponseDto): AuthResponse
{
    return {
        userId: dto.userId,
        username: dto.username,
        token: dto.token
    };
}