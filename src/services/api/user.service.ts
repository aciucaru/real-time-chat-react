import { axiosAuthClient } from "../auth/axios-clients";
import type { UserResponseDTO } from "../../models/dto/UserResponseDTO";

const BASE_URL = "/api/users";

export async function gatAllUsers(): Promise<UserResponseDTO[]>
{
    const response = await axiosAuthClient.get<UserResponseDTO[]>(BASE_URL);

    return response.data;
}