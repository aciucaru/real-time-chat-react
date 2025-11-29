import type { GroupResponseDTO } from "../dto/GroupResponseDTO";
import type { Group } from "../models/Group";

export function toGroup(dto: GroupResponseDTO): Group
{
    return {
        id: dto.id,
        name: dto.name
    };
}