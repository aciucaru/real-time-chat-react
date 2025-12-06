import axios from "axios";

import type { MessageResponseDTO } from "../../models/dto/MessageResponseDTO";
import { axiosAuthClient } from "../auth/axios-clients";
import type { MessageRequestDTO } from "../../models/dto/MessageRequestDTO";

const BASE_URL = "/api/messages";

// POST /api/messages/{receiverId}
// Sends a message from the current loged-in user to another user (receiver).
// The current user is identified by JWT token and the receiver is identified by ID.
export async function sendMessage(payload: MessageRequestDTO): Promise<MessageResponseDTO>
{
    try
    {
        const response = await axiosAuthClient.post<MessageResponseDTO>(`${BASE_URL}/${payload.receiverId}`,
                                                                        // send everything from the payload
                                                                        payload
                                                                    );
        return response.data;
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Error sending message"); }
}

// GET /api/message/{senderId}
// Gets the messages between the current user (identified by JWT) and another user (identified by 'senderId')
export async function getMessagesFromUser(senderId: string): Promise<MessageResponseDTO[]>
{
    const response = await axiosAuthClient.get<MessageResponseDTO[]>(`${BASE_URL}/${senderId}?limit=100`);
    return response.data;
}