import type { CreateGroupRequestDTO } from "../dto/CreateGroupRequestDTO";
import type { Group } from "../models/Group";
import type { GroupResponseDTO } from "../dto/GroupResponseDTO";
import { toGroup } from "../mapper/group.mapper";

import axios from "axios";


const BASE_URL = "api/groups";

// POST /api/groups
// Create a new group
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
// Get all groups of the current logged-in user
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
// Get group details
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
// Delete a group (if the user is the creator/admin)
export async function deleteGroup(groupId: string, token: string): Promise<void>
{
    try
    {
        await axios.delete(`${BASE_URL}/${groupId}`,
                            { headers: {
                                        "Content-Type": "application/json",
                                        // pass JWT token
                                        Authorization: `Bearer ${token}`,
                                    },
                            });
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to delete group"); }
}