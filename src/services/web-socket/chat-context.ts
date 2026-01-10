import { createContext } from "react";
import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";

export interface ChatContextType
{
    connected: boolean;
    onlineUsers: number[];

    sendMessage: (receiverId: number, content: string) => void;

    addMessageHandler: (
        // The argument of this function is a callback that runs whenever a message arrives
        handler: (msg: MessageResponseDto) => void
        // And the return value is a void function, which removes that callback (is used for cleanup)
    ) => () => void;

    close: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);