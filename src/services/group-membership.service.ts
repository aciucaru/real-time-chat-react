import type { AddGroupMemberRequestDTO } from "../dto/AddGroupMemberRequestDTO";

import axios from "axios";
import type { User } from "../models/User";
import type { UserResponseDTO } from "../dto/UserResponseDTO";
import { toUser } from "../mapper/user.mapper";


const BASE_URL = "api/groups";

// POST /api/groups/{groupId}/members
// Add a user to a group
export async function addUserToGroup(groupId: string,
                                    payload: AddGroupMemberRequestDTO,
                                    token: string): Promise<void>
{
    try
    {
        await axios.post(`${BASE_URL}/${groupId}/members`,
                        payload,
                        { headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                        });
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to add member"); }
}

// GET /api/groups/{groupId}/members
// Get the list of users in a group
export async function getGroupUsers(groupId: string, token: string): Promise<User[]>
{
    try
    {
        const { data } = await axios.get<UserResponseDTO[]>(`${BASE_URL}/${groupId}/members`,
                                                            { headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                            });
        return data.map(toUser);
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || error.message || "Failed to fetch group members"); }
}

// DELETE /api/groups/{groupId}/members/{userId}
// Remove a user from a group
export async function removeUserFromGroup(groupId: string, userId: string, token: string): Promise<void>
{
    try
    {
        axios.delete(`${BASE_URL}/${groupId}/members/${userId}`,
                    { headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                    });
    }
}
                                    