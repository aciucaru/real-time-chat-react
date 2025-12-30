import { useEffect, useRef, useState } from "react";

import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import type { UserResponseDto } from "../../models/dto/UserResponseDto";
import MessageList from "../components/MessageList";
import UserList from "../components/UserList";
import MessageEditor from "../components/MessageEditor";
import { useAuthHook } from "../../services/auth/use-auth-hook";

import styles from "./ChatPage.module.css";
import { useChatSocket, type IncomingMessage } from "../../services/ws/chatSocket";

// The main chat page
// export default function ChatPage()
// {
//     // Get the ID of the current user
//     const { user } = useAuthHook();
//     const currentUserId = user?.id;

//     const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);

//     // We use two states for the displayed messages (the conversation)
//     // - a global list of all messages
//     const [allMessages, setAllMessages] = useState<MessageResponseDto[]>([]);
//     // - a list of messages only for the current conversation (between the current user and a user he selected)
//     const [messages, setMessages] = useState<MessageResponseDto[]>([]);

//     const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
//     const [messagesError, setMessagesError] = useState<string | null>(null);

//     // Here we have an error, because sendPrivate does not exist anymore
//     // For Web Sockets:
//     const { connected, sendPrivate, addMessageHandler } = useChatSocket();

//     // Effect for Web Sockets. When a message arrives, we append it to the message history, but only
//     // if it belongs to the current conversation
//     useEffect(() =>
//         {
//             const unsubscribe = addMessageHandler((msg) => {
//                 // Here we have another error, because 'type' is no longer a property of messages
//                 if (msg.type === "private") {
//                     const incoming = msg as IncomingMessage;

//                     // Build MessageResponseDto
//                     const message: MessageResponseDto = {
//                         id: "ws-" + Date.now(),
//                         senderId: String(incoming.from),
//                         receiverId: String(incoming.to),
//                         content: incoming.content,
//                         timestamp: new Date().toISOString(),
//                     };

//                     // Always append to global message log
//                     setAllMessages(prev => [...prev, message]);

//                     // Append to current conversation only if relevant
//                     if (!selectedUser || !currentUserId) return;

//                     const isForThisChat =
//                         (String(incoming.from) === selectedUser.id && String(incoming.to) === currentUserId) ||
//                         (String(incoming.from) === currentUserId && String(incoming.to) === selectedUser.id);

//                     if (isForThisChat) {
//                         setMessages(prev => [...prev, message]);
//                     }
//                 }
//             });

//             return () => {
//                 unsubscribe();
//             };
//         }, [addMessageHandler, selectedUser, currentUserId]
//     );

//     // Send message via WebSocket
//     const handleSendMessageWebSocket = async (content: string) =>
//     {
//         if (!selectedUser || !currentUserId)
//             return;

//         // If the WebSocket connection is not opened/established, then simply return, in order
//         // to avoid sending a message without a connection
//         if (!connected)
//         {
//             console.warn("Cannot send: WebSocket not connected yet");
//             return;
//         }

//         // If there is a WebSocket connection, then try to send the message
//         try
//         {
//             sendPrivate(Number(selectedUser.id), content);

//             // Optimistically add message to UI
//             const message: MessageResponseDto = {
//                 id: "local-" + Date.now(),
//                 senderId: String(currentUserId),
//                 receiverId: String(selectedUser.id),
//                 content,
//                 timestamp: new Date().toISOString()
//             };

//             setAllMessages(previousMessages => [...previousMessages, message]);
//             setMessages(prev => [...prev, message]);
//         }
//         catch (error: any) { console.error(`Sending message through WebSocket failed: ${error}`); }
//     };

//     // Callback when user is selected
//     const handleUserSelected = (user: UserResponseDto) =>
//     {
//         setSelectedUser(user);
//         // loadMessages(user.id); // do not call here ever!

//         // Filter allMessages to show only messages with this user
//         setMessages(
//             allMessages.filter(
//                 (msg) =>
//                     (msg.senderId === String(user.id) && msg.receiverId === String(currentUserId)) ||
//                     (msg.senderId === String(currentUserId) && msg.receiverId === String(user.id))
//             )
//         );
//     };

//     return (
//     <div className={`${styles.mainContainer}`}>
//         <div className={`${styles.mainBackground}`}></div>
//         <div className={`${styles.mainBackgroundGradient}`}></div>

//         <div className={`${styles.userListContainer}`}>
//             <UserList onUserSelected={handleUserSelected} />
//         </div>

//         <div className={`${styles.messageListContainer}`}>
//             <MessageList
//                 messages={messages}
//                 loading={isLoadingMessages}
//                 error={messagesError}
//             />
//         </div>


//         {selectedUser &&
//             <div className={`${styles.messageEditorContainer}`}>
//                 <MessageEditor onSend={handleSendMessageWebSocket}/>
//             </div>
//         }
//     </div>
//     );
// }

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
    //         const unsubscribe = addMessageHandler((incoming: IncomingMessage) => {
    //             if (!incoming) return;

    //             // Build MessageResponseDto
    //             const wsMessage: MessageResponseDto = {
    //                 id: "ws-" + Date.now(),
    //                 senderId: String(incoming.from),
    //                 receiverId: String(incoming.to),
    //                 content: incoming.content,
    //                 timestamp: new Date().toISOString(),
    //             };

    //             // Always append to global message history
    //             setAllMessages(prev => [...prev, wsMessage]);

    //             // Check if the message matches the conversation
    //             if (!selectedUser || !currentUserId)
    //                 return;

    //             // If it does match, then append to current conversation
    //             const isForThisChat =
    //                 (wsMessage.senderId === String(selectedUser.id) &&
    //                 wsMessage.receiverId === String(currentUserId)) ||
    //                 (wsMessage.senderId === String(currentUserId) &&
    //                 wsMessage.receiverId === String(selectedUser.id));

    //             if (isForThisChat)
    //                 setMessages(prev => [...prev, wsMessage]);
    //         });

    //         // return () => unsubscribe();
    //         return () => { unsubscribe(); };
    //     },
    //     // [addMessageHandler, selectedUser, currentUserId]
    //     [addMessageHandler]
    // );
    useEffect(() =>
        {
            const unsubscribe = addMessageHandler((incoming: IncomingMessage) => {
                if (!incoming) return;

                const wsMessage: MessageResponseDto = {
                    id: "ws-" + Date.now(),
                    senderId: String(incoming.from),
                    receiverId: String(incoming.to),
                    content: incoming.content,
                    timestamp: new Date().toISOString(),
                };

                setAllMessages(prev => [...prev, wsMessage]);

                const sel = selectedUserRef.current;
                const me = currentUserIdRef.current;

                if (!sel || !me) return;

                const isForThisChat =
                    (wsMessage.senderId === sel.id && wsMessage.receiverId === me) ||
                    (wsMessage.senderId === me && wsMessage.receiverId === sel.id);

                if (isForThisChat)
                    setMessages(prev => [...prev, wsMessage]);
            });

            return () => { unsubscribe(); };
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

        setMessages(
            allMessages.filter(
                msg =>
                    (msg.senderId === String(user.id) &&
                        msg.receiverId === String(currentUserId)) ||
                    (msg.senderId === String(currentUserId) &&
                        msg.receiverId === String(user.id))
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