import { axiosAuthClient } from "../auth/axios-clients";
import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";

const BASE_URL = "http://localhost:8080/api/messages";

// GET /api/messages/history?userId1=X&userId2=Y
// Get message history between two users
// Only authenticated users can access this endpoint
export async function getMessageHistory(userId1: number, userId2: number): Promise<MessageResponseDto[]>
{
    const response = await axiosAuthClient.get<MessageResponseDto[]>(
        `${BASE_URL}/history`,
        {
            params:
            {
                userId1,
                userId2
            }
        }
    );

    return response.data;
}