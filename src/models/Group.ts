export interface Group
{
    id: string;
    name: string;
    description: string;
    ownerId: string;  // ID of the creator/admin, aslo UUID type on the back-end
}