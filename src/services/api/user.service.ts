import { axiosAuthClient, axiosPublicClient } from "../auth/axios-clients";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";

const BASE_URL = "http://localhost:8080/api/users";

// GET /api/users
// Get all users so that the current loged-in user can view the list of users an choose
// a user to chat with.
// Only a loged-in user is able to get the list of all users.
export async function getAllUsers(): Promise<UserResponseDto[]>
{
    const response = await axiosAuthClient.get<UserResponseDto[]>(BASE_URL);
    // const response = await axiosPublicClient.get<UserResponseDto[]>(BASE_URL);

    return response.data;
}