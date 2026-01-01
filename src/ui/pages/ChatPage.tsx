import { useEffect, useRef, useState } from "react";

import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import MessageList from "../components/MessageList";
import UserList from "../components/UserList";
import MessageEditor from "../components/MessageEditor";
import { useAuthHook } from "../../services/auth/use-auth-hook";

import styles from "./ChatPage.module.css";
import { useChatSocket, type IncomingMessage } from "../../services/web-socket/useChatSocket";

// The main chat page
export default function ChatPage()
{
    // Get the ID of the current user
    const { user } = useAuthHook();
    const currentUserId = user?.id;

    const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);

    // We use two states for the displayed messages (the conversation)
    // - a global list of all messages
    const [allMessages, setAllMessages] = useState<MessageResponseDto[]>([]);
    // - a list of messages only for the current conversation (between the current user and a user he selected)
    const [messages, setMessages] = useState<MessageResponseDto[]>([]);

    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
    const [messagesError, setMessagesError] = useState<string | null>(null);

    // WebSocket
    const { connected, sendMessage, addMessageHandler } = useChatSocket();

    const selectedUserRef = useRef<UserResponseDto | null>(null);
    const currentUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        currentUserIdRef.current = currentUserId ? String(currentUserId) : null;
    }, [currentUserId]);

    // Effect for Web Sockets. When a message arrives, we append it to the message history, but only
    // if it belongs to the current conversation
    // useEffect(() =>
    //     {
    //         console.log("ChatPage effect MOUNTED (Subscribing to WebSockets)");

    //         const unsubscribe = addMessageHandler((incoming: IncomingMessage) => {
    //             if (!incoming) return;

    //             const wsMessage: MessageResponseDto = {
    //                 id: "ws-" + Date.now(),
    //                 senderId: String(incoming.from),
    //                 receiverId: String(incoming.to),
    //                 content: incoming.content,
    //                 timestamp: new Date().toISOString(),
    //             };

    //             setAllMessages(prev => [...prev, wsMessage]);

    //             const sel = selectedUserRef.current;
    //             const me = currentUserIdRef.current;

    //             console.log("RECEIVE DEBUG:",
    //                 {
    //                     incomingFrom: incoming.from,
    //                     incomingTo: incoming.to,
    //                     myIdInRef: me,
    //                     selectedIdInRef: sel?.id,
    //                     types:
    //                     {
    //                         incomingFrom: typeof incoming.from,
    //                         myId: typeof me,
    //                         selId: typeof sel?.id
    //                     }
    //                 });

    //             if (!sel || !me)
    //             {
    //                 console.warn("MESSAGE DROPPED: No user selected or current user ID missing");
    //                 return;
    //             }

    //             const selId = String(sel.id);
    //             const isForThisChat = (wsMessage.senderId == selId && wsMessage.receiverId == me) ||
    //                                     (wsMessage.senderId == me && wsMessage.receiverId == selId);

    //             console.log("MATCH CHECK:",
    //             {
    //                 msgSender: wsMessage.senderId,
    //                 msgReceiver: wsMessage.receiverId,
    //                 selected: selId,
    //                 me: me,
    //                 match: isForThisChat
    //             });

    //             console.log("IS FOR THIS CHAT?", isForThisChat);

    //             if (isForThisChat)
    //                 setMessages(prev => [...prev, wsMessage]);
    //         });

    //         return () =>
    //         {
    //             console.log("ChatPage effect UNMOUNTED (Unsubscribing from WebSockets)");
    //             unsubscribe();
    //         };
    //     },
    //     [addMessageHandler]
    // );
    useEffect(() => {
        console.log("ChatPage effect MOUNTED (Subscribing to WebSockets)");

        const unsubscribe = addMessageHandler((incoming: IncomingMessage) =>
            {
                if (!incoming) return;

                // Convert numbers to strings immediately
                const fromStr = String(incoming.from);
                const toStr = String(incoming.to);

                const wsMessage: MessageResponseDto = {
                    id: "ws-" + Date.now(),
                    senderId: fromStr,
                    receiverId: toStr,
                    content: incoming.content,
                    timestamp: new Date().toISOString(),
                };

                setAllMessages(prev => [...prev, wsMessage]);

                const sel = selectedUserRef.current;
                const me = currentUserIdRef.current;

                console.log("RECEIVE DEBUG:", {
                    incomingFrom: fromStr,
                    incomingTo: toStr,
                    myIdInRef: me,
                    selectedIdInRef: sel?.id,
                    types: {
                        incomingFrom: typeof fromStr,
                        incomingTo: typeof toStr,
                        myId: typeof me,
                        selId: typeof sel?.id
                    }
                });

                if (!sel || !me) {
                    console.warn("MESSAGE DROPPED: No user selected or current user ID missing");
                    return;
                }

                // Ensure all comparisons use strings
                const selId = String(sel.id);
                const isForThisChat = 
                    (wsMessage.senderId == selId && wsMessage.receiverId == me) ||
                    (wsMessage.senderId == me && wsMessage.receiverId == selId);

                console.log("MATCH CHECK:", {
                    msgSender: wsMessage.senderId,
                    msgReceiver: wsMessage.receiverId,
                    selected: selId,
                    me: me,
                    match: isForThisChat
                });

                console.log("IS FOR THIS CHAT?", isForThisChat);

                if (isForThisChat) {
                    setMessages(prev => [...prev, wsMessage]);
                }
            });

            return () =>
            {
                console.log("ChatPage effect UNMOUNTED (Unsubscribing from WebSockets)");
                unsubscribe();
            };
        },
        [addMessageHandler]
    );

    // Send message via WebSocket
    const handleSendMessageWebSocket = async (content: string) =>
    {
        console.log("SEND WS ->", {
            to: selectedUser?.id,
            content,
            connected
        });

        if (!selectedUser || !currentUserId)
        {
            console.warn("ABORT SEND — missing selectedUser or currentUserId", {
                selectedUser,
                currentUserId
            });

            return;
        }

        if (!connected)
        {
            console.warn("Cannot send — WebSocket not connected");
            return;
        }

        try
        {
            // send (backend inserts senderId)
            sendMessage(Number(selectedUser.id), content);

            // optimistic UI append
            const optimistic: MessageResponseDto = {
                id: "local-" + Date.now(),
                senderId: String(currentUserId),
                receiverId: String(selectedUser.id),
                content,
                timestamp: new Date().toISOString(),
            };

            setAllMessages(prev => [...prev, optimistic]);
            setMessages(prev => [...prev, optimistic]);
        }
        catch (error)
        { console.error("Sending via WebSocket failed:", error); }
    };


    // Callback when user is selected.
    // When selecting a user, show only messages of that conversation.
    const handleUserSelected = (user: UserResponseDto) =>
    {
        setSelectedUser(user);

        // Ensure consistent string comparison
        const userId = String(user.id);
        const currentId = String(currentUserId);

        setMessages(
            allMessages.filter(
                msg =>
                {
                    const senderId = String(msg.senderId);
                    const receiverId = String(msg.receiverId);

                    return (
                        (senderId === userId && receiverId === currentId) ||
                        (senderId === currentId && receiverId === userId)
                    );
                }
            )
        );
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