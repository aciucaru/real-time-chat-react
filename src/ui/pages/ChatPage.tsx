import { useEffect, useState } from "react";

import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";

import { getHistory, sendMessage } from "../../services/api/message.service";

import MessageList from "../components/MessageList";
import UserList from "../components/UserList";
import MessageEditor from "../components/MessageEditor";
import type { MessageRequestDto } from "../../models/dto/MessageRequestDto";
import { useAuthHook } from "../../services/auth/use-auth-hook";

import styles from "./ChatPage.module.css";

// The main chat page
export default function ChatPage()
{
    // Get the ID of the current user
    const { user } = useAuthHook();
    const currentUserId = user?.id;

    const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
    const [messages, setMessages] = useState<MessageResponseDto[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
    const [messagesError, setMessagesError] = useState<string | null>(null);


    // Callback when user is selected
    const handleUserSelected = (user: UserResponseDto) =>
    {
        setSelectedUser(user);
        // loadMessages(user.id); // do not call here
    };

    // Callback called by MessageEditor
    const handleSendMessage = async (content: string) =>
    {
        if (!selectedUser || !currentUserId)
        {
            console.log("ERROR: currentUserId is null!");
            return;
        }

        const dto: MessageRequestDto =
        {
            senderId: currentUserId,
            receiverId: selectedUser.id,
            content: content,
        };

        // Send the message
        const newMessage = await sendMessage(dto);

        // After sending the message, add the message to the UI
        setMessages( (previousList) => [...previousList, newMessage] );
    };

    // Load corresponding messages whenever the selected user changes
    useEffect( () =>
        {
            // If there is no curent user or no receiving user is selected, then do nothing
            if (!currentUserId || !selectedUser)
                return;

            // Clear messages instantly
            setMessages([]);

            // React's useEffect() cannot be async, so we create an async function inside it and call that
            const loadMessages = async () =>
            {
                try
                {
                    setIsLoadingMessages(true);

                    const messageHistory = await getHistory(currentUserId, selectedUser.id);
                    setMessages(messageHistory);
                    setMessagesError(null);
                }
                catch (error: any)
                { setMessagesError(error.message || "Error fetching messages") }
                finally
                { setIsLoadingMessages(false); }
            };

            // Call the internal async function
            loadMessages();
        },
        [currentUserId, selectedUser, ] // run this effect whenever 'currentUserId' and 'selectedUser' change
    );

    return (
    <div className={`${styles.mainContainer}`}>
        <div className={`${styles.mainBackground}`}></div>
        <div className={`${styles.mainBackgroundGradient}`}></div>

        <div className={`${styles.userListContainer}`}>
            <UserList onUserSelected={handleUserSelected} />
        </div>

        <div className={`${styles.messageListContainer}`}>
            <MessageList
                messages={messages}
                loading={isLoadingMessages}
                error={messagesError}
            />
        </div>


        {selectedUser &&
            <div className={`${styles.messageEditorContainer}`}>
                <MessageEditor onSend={handleSendMessage}/>
            </div>
        }
    </div>
    );
}