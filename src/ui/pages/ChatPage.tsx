import { useEffect, useMemo, useRef, useState } from "react";

import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import MessageList from "../components/MessageList";
import UserList from "../components/UserList";
import MessageEditor from "../components/MessageEditor";
import { useAuthHook } from "../../services/auth/use-auth-hook";
import { useChatSocket } from "../../services/web-socket/useChatSocket";


import styles from "./ChatPage.module.css";


// The main chat page
export default function ChatPage()
{
    // Get the ID of the current user
    const { user } = useAuthHook();
    const currentUserId = user?.id ?? null;

    const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);

    // We use a single source for the displayed messages (the conversation)
    const [allMessages, setAllMessages] = useState<MessageResponseDto[]>([]);

    const [isLoadingMessages] = useState<boolean>(false);
    const [messagesError] = useState<string | null>(null);

    const { connected, sendMessage, addMessageHandler } = useChatSocket();

    const selectedUserRef = useRef<UserResponseDto | null>(null);
    const currentUserIdRef = useRef<number | null>(null);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);

    // 🔹 WebSocket subscription
    useEffect(() => {
        console.log("ChatPage mounted – subscribing to WebSocket");

        const unsubscribe = addMessageHandler((incoming: MessageResponseDto) => {
            if (!incoming) return;

            const messageId =
                incoming.id ??
                `${incoming.senderId}-${incoming.receiverId}-${incoming.timestamp}`;

            setAllMessages(prev => {
                // Deduplicate (important for self-chat)
                if (prev.some(m => m.id === messageId)) {
                    return prev;
                }

                return [
                    ...prev,
                    {
                        ...incoming,
                        id: messageId
                    }
                ];
            });
        });

        return () => {
            console.log("ChatPage unmounted – unsubscribing from WebSocket");
            unsubscribe();
        };
    }, [addMessageHandler]);

    // 🔹 Derived conversation messages
    const messages = useMemo(() => {
        if (!selectedUser || !currentUserId) return [];

        return allMessages.filter(msg =>
            (msg.senderId === selectedUser.id && msg.receiverId === currentUserId) ||
            (msg.senderId === currentUserId && msg.receiverId === selectedUser.id)
        );
    }, [allMessages, selectedUser, currentUserId]);

    // Send message via WebSocket
    const handleSendMessageWebSocket = async (content: string) =>
    {
        console.log("SEND WS ->",
        {
            to: selectedUser?.id,
            content,
            connected
        });

        if (!selectedUser || !currentUserId)
        {
            console.warn("ABORT SEND — missing selectedUser or currentUserId",
            {
                selectedUser,
                currentUserId
            });
            return;
        }
        else if (!connected)
        {
            console.warn("Cannot send — WebSocket not connected");
            return;
        }

        try
        {
            // Just send - the message will come back via WebSocket
            sendMessage(selectedUser.id, content);
        }
        catch (error) { console.error("Sending via WebSocket failed:", error); }
    };

    // Callback when user is selected.
    // When selecting a user, show only messages of that conversation.
    const handleUserSelected = (user: UserResponseDto) =>
    {
        setSelectedUser(user);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.mainBackground}></div>
            <div className={styles.mainBackgroundGradient}></div>

            <div className={styles.userListContainer}>
                <UserList onUserSelected={handleUserSelected} />
            </div>

            <div className={styles.messageListContainer}>
                <MessageList
                    messages={messages}
                    loading={isLoadingMessages}
                    error={messagesError}
                />
            </div>

            {selectedUser && (
                <div className={styles.messageEditorContainer}>
                    <MessageEditor onSend={handleSendMessageWebSocket} />
                </div>
            )}
        </div>
    );
}