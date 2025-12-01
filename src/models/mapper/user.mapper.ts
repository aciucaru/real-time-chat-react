import type { UserResponseDTO } from "../dto/UserResponseDTO";
import type { User } from "../entity/User";

export function toUser(dto: UserResponseDTO): User
{
    return {
                id: dto.id,
                username: dto.username
            };
}