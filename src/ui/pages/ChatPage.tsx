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
import { useChatSocket, type IncomingPrivate } from "../../services/ws/chatSocket";

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

    // For Web Sockets:
    const { sendPrivate, addMessageHandler } = useChatSocket();

    // Effect for Web Sockets. When a message arrives, we append it to the message history, but only
    // if it belongs to the current conversation
    useEffect( () =>
        {
            const unsubscribe = addMessageHandler( (msg) =>
            {
                if (msg.type === "private")
                {
                    const incoming = msg as IncomingPrivate;

                    // Append message if it's between current user and 'selectedUser'
                    const otherId = selectedUser?.id;
                    if (!otherId)
                        return;

                    // If message is from this conversation
                    const isForThisChat = (incoming.from === Number(otherId) && incoming.to === Number(currentUserId)) ||
                                            (incoming.from === Number(currentUserId) && incoming.to === Number(otherId));
                    if (isForThisChat)
                    {
                        setMessages( previousMessages => [...previousMessages, {
                            id: "ws-" + Date.now(), // optionally set temporary id
                            senderId: String(incoming.from),
                            receiverId: String(incoming.to),
                            content: incoming.content,
                            timestamp: new Date().toISOString()
                        }]);
                    }
                    // Optionally, we could update UI from user presence with 'onlineUsers' value from hook
                    // else if (msg.type === "onlineUsers") { }
                }
            });

            // Wrap the unsubscribe function into a void function, so we can return it safely
            return () =>
            {
                unsubscribe(); // call the unsubscribe
                return; // ensures the effect cleanup returns void
            };
        },
        [addMessageHandler, selectedUser, currentUserId]
    );

    // Send message via WebSocket
    const handleSendMessageWebSocket = async (content: string) =>
    {
        if (!selectedUser || !currentUserId)
            return;

        try
        {
            // Use WebSockets custom send function
            sendPrivate(Number(selectedUser.id), content);

            // Update UI immediately (hoping that the messag e wil be sent successfully) and
            // then wait for server response to confirm that message was actually sent successfully
            setMessages( previousMessages => [...previousMessages, {
                id: "local-" + Date.now(),
                senderId: String(currentUserId),
                receiverId: String(selectedUser.id),
                content,
                timestamp: new Date().toISOString() 
            }]);
        }
        catch (error: any)
        { console.error(`Sending message through WebSocket failed: ${error}`); }
    };




    // Callback when user is selected
    const handleUserSelected = (user: UserResponseDto) =>
    {
        setSelectedUser(user);
        // loadMessages(user.id); // do not call here
    };

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
                <MessageEditor onSend={handleSendMessageWebSocket}/>
            </div>
        }
    </div>
    );
}