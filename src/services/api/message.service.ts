import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import { axiosAuthClient, axiosPublicClient } from "../auth/axios-clients";
import type { MessageRequestDto } from "../../models/dto/MessageRequestDto";

const BASE_URL = "http://localhost:8080/api/messages";

// POST /api/messages
// Sends a message from the current loged-in user to another user (receiver).
// The current user is identified by JWT token and the receiver is identified by ID.
export async function sendMessage(payload: MessageRequestDto): Promise<MessageResponseDto>
{
    try
    {
        const response = await axiosAuthClient.post<MessageResponseDto>(BASE_URL,
                                                                        // send everything from the payload
                                                                        payload
                                                                    );

        // const response = await axiosPublicClient.post<MessageResponseDto>(BASE_URL,
        //                                                         // send everything from the payload
        //                                                         payload
        //                                                     );
        return response.data;
    }
    catch (error: any)
    { throw new Error(error.response?.data?.message || "Error sending message"); }
}

// GET /api/messages/history
// Gets the messages between the current user (identified by JWT) and another user (identified by 'senderId')
export async function getHistory(userId1: string, userId2: string): Promise<MessageResponseDto[]>
{
    const url = `${BASE_URL}/history?userId1=${userId1}&userId2=${userId2}&limit=100`;

    const response = await axiosAuthClient.get<MessageResponseDto[]>(url);
    // const response = await axiosPublicClient.get<MessageResponseDto[]>(url);

    return response.data;
}