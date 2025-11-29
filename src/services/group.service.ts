import axios from "axios";
import type { CreateGroupRequestDTO } from "../dto/CreateGroupRequestDTO";
import type { Group } from "../models/Group";
import { toGroup } from "../mapper/group.mapper";
import type { GroupResponseDTO } from "../dto/GroupResponseDTO";

const BASE_URL = "api/groups";

// POST /api/groups
export async function createGroup(payload: CreateGroupRequestDTO): Promise<Group>
{
    try
    {
        const { data } = await axios.post(`${BASE_URL}/signup`,
                                    payload,
                                    { headers: {"Content-Type": "application/json",}, });
        return toGroup(data);
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Signup failed"); }
}

// GET /api/groups
export async function getGroupsByUser(token: string): Promise<Group[]>
{
    try
    {
        const { data } = await axios.get<GroupResponseDTO[]>(BASE_URL,
                                                            { headers: {
                                                                        "Content-Type": "application/json",
                                                                        // pass JWT token
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                            });
        return data.map(toGroup);
    }
    catch(error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to fetch user's groups"); }
}

// not really necessary, can be removed
// GET /api/groups/{groupId}
export async function getGroupDetails(groupId: string, token: string): Promise<Group>
{
    try
    {
        const { data } = await axios.get<GroupResponseDTO>(`${BASE_URL}/${groupId}`,
                                                            { headers: {
                                                                    "Content-Type": "application/json",
                                                                    // pass JWT token
                                                                    Authorization: `Bearer ${token}`,
                                                                    },
                                                            });
        return toGroup(data);
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to fetch group"); }
}

// DELETE /api/groups/{groupId}
export async function deleteGroup(groupId: string, token: string): Promise<void>
{
    try
    {
        await axios.delete(`${BASE_URL}/${groupId}`,
                            { headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                            });
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to delete group"); }
}