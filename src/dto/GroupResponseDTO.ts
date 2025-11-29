export interface GroupResponseDTO
{
    id: string; // UUID type on the back-end which will serialize to string in JSON format
    name: string;
    description: string;
    ownerId: string;  // ID of the creator/admin, aslo UUID type on the back-end
}