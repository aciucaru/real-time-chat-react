import type { AddGroupMemberRequestDTO } from "../dto/AddGroupMemberRequestDTO";

import axios from "axios";


const BASE_URL = "api/groups";

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
                                    