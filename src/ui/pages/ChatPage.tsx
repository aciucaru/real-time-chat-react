import { useEffect, useState } from "react";

import type { MessageResponseDTO } from "../../models/dto/MessageResponseDTO";
import type { UserResponseDTO } from "../../models/dto/UserResponseDTO";
import type { SendMessageRequestDTO } from "../../models/dto/SendMessageRequestDTO";

import { getMessagesFromUser, sendMessage } from "../../services/api/message.service";

import MessageList from "../components/MessageList";
import UserList from "../components/UserList";

// The main 
export default function ChatPage()
{
    const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
    const [messages, setMessages] = useState<MessageResponseDTO[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

    // Load corresponding messages whenever the selcted user changes
    useEffect( () =>
        {
            // If no user is selected, then do nothing
            if (!selectedUser)
                return;

            // React's useEffect() cannot be async, so we create an async function inside it and call that
            const loadMessages = async () =>
            {
                try
                {
                    setIsLoadingMessages(true);

                    const messageList = await getMessagesFromUser(selectedUser.id);
                    setMessages(messageList);
                }
                finally
                { setIsLoadingMessages(false); }
            };

            // Call the internal async function
            loadMessages();
        },
        [selectedUser] // run this effect whenever 'selectedUser' changes
    );

    // Callback called by MessageEditor
    const handleSendMessage = async (content: string) =>
    {
        if (!selectedUser)
            return;

        const dto: SendMessageRequestDTO =
        {
            receiverId: selectedUser.id,
            content: content
        };

        // Send the message
        const newMessage = await sendMessage(dto);

        // After sending the message, add the message to the UI
        setMessages( (previousList) => [...previousList, newMessage] );
    };

    return (
    <div>
        <UserList onUserSelected={setSelectedUser} />

        <div>
        <MessageList
            messages={messages}
            loading={isLoadingMessages}
            selectedUser={selectedUser}
        />

        {selectedUser && (
            <MessageEditor onSend={handleSendMessage} />
        )}
        </div>
    </div>
    );
}