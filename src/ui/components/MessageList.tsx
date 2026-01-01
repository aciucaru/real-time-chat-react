import { useEffect, useRef } from "react";
import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import { useAuthHook } from "../../services/auth/use-auth-hook";

import styles from "./MessageList.module.css";

interface MessageListProps
{
    // The list of messages fetched from outside this component
    messages: MessageResponseDto[]; // the array of messages

    // If the messages are still loading
    loading: boolean;

    // The MessageList React component does not fetch its own messages, so it will not know
    // if there was an error fetching the messages.
    // This is why we pass it an error prop, simbolizing that there was an error fetching the messages,
    // if this error object is not null.
    error: string | null;
}

export default function MessageList(
    {
        messages,
        loading,
        error
    }: MessageListProps
)
{
    const { user } = useAuthHook();

    // A reference to the div that represents the bottom message
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // React effect to automatically scroll to bottom whenever s new massage appears
    useEffect( () =>
        {
            // Scroll to the <div>, with smooth scrolling
            bottomRef.current?.scrollIntoView({behavior: "smooth"});
        },
        [messages] // run this effect every time 'isAuthenticated' changes
    );

    if (loading)
        return <div>Loading messages...</div>

    if (error)
        return <div>{error}</div>

    return (
    <div className={`${styles.mainContainer}`}>
        {messages.map( (msg) =>
            {
                // Used for displaying messages diferently
                // const isMine = msg.senderId === user?.id;
                const isMine = String(msg.senderId) === String(user?.id);

                // Here we convert/map the message DTO to HTML items
                return (
                    <div 
                        key={msg.id}
                        className={`${styles.messageContainer} ${isMine ? styles.currentUserMessage : styles.otherUserMessage}`}
                    >
                        <div className={styles.messageContent}>{msg.content}</div>
                        <div className={styles.messageTimestamp}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                );
            }
        )}

        {/* Invisible element used for auto-scroll */}
        <div ref={bottomRef}></div>
    </div>
    );
}