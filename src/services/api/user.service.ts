import { axiosAuthClient } from "../auth/axios-clients";
import type { UserResponseDTO } from "../../models/dto/UserResponseDTO";

const BASE_URL = "/api/users";

// GET /api/users
// GEt all users so that the current loged-in user can view the list of users an choose
// a user to chat with.
// Only a loged-in user is able to get the list of all users.
export async function gatAllUsers(): Promise<UserResponseDTO[]>
{
    const response = await axiosAuthClient.get<UserResponseDTO[]>(BASE_URL);

    return response.data;
}