import axios from "axios";

import type { MessageResponseDTO } from "../../models/dto/MessageResponseDTO";
import type { SendMessageRequestDTO } from "../../models/dto/SendMessageRequestDTO";

const BASE_URL = "/api/messages";

// POST /api/messages/{receiverId}
// Sends a message from the current loged-in user to another user (receiver).
// The current user is identified by JWT token and the receiver is identified by ID.
export async function sendMessage(token: string, payload: SendMessageRequestDTO, ): Promise<MessageResponseDTO>
{
    try
    {
        const response = await axios.post<MessageResponseDTO>(`${BASE_URL}/${payload.receiverId}`,
                                                            { content: payload.content }, // only send content
                                                            { headers: {
                                                                    Authorization: `Bearer ${token}`,
                                                                    "Content-Type": "application/json",
                                                                    },
                                                            });
        return response.data;
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Error sending message"); }
}

// GET /api/message/{senderId}
// Gets the messages between the current user (identified by JWT) and another user (identified by 'senderId')
export async function getMessagesFromUser(token: string, senderId: string): Promise<MessageResponseDTO[]>
{
    try
    {
        const response = await axios.get<MessageResponseDTO[]>(`${BASE_URL}/${senderId}`,
                                                                { headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                });
        return response.data;
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Error fetching messages"); }
}