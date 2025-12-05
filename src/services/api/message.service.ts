import axios from "axios";

import type { MessageDTO } from "../../models/dto/MessageDTO";
import type { SendMessageRequestDTO } from "../../models/dto/SendMessageRequestDTO";
import { axiosAuthClient } from "../auth/axios-clients";

const BASE_URL = "/api/messages";

// POST /api/messages/{receiverId}
// Sends a message from the current loged-in user to another user (receiver).
// The current user is identified by JWT token and the receiver is identified by ID.
export async function sendMessage(payload: SendMessageRequestDTO): Promise<MessageDTO>
{
    try
    {
        const response = await axiosAuthClient.post<MessageDTO>(`${BASE_URL}/${payload.receiverId}`,
                                                                        // only send content
                                                                        { content: payload.content }, 
                                                                    );
        return response.data;
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Error sending message"); }
}

// GET /api/message/{senderId}
// Gets the messages between the current user (identified by JWT) and another user (identified by 'senderId')
export async function getMessagesFromUser(senderId: string): Promise<MessageDTO[]>
{
    const response = await axiosAuthClient.get<MessageDTO[]>(`${BASE_URL}/${senderId}?limit=100`);
    return response.data;
}