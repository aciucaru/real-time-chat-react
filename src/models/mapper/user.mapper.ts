import type { UserResponseDto } from "../dto/UserResponseDto";
import type { User } from "../entity/User";

export function toUser(dto: UserResponseDto): User
{
    return {
                id: dto.id,
                username: dto.username
            };
}