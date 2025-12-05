import { useEffect, useRef } from "react";
import type { MessageResponseDTO } from "../../models/dto/MessageResponseDTO";
import { useAuthHook } from "../../services/auth/use-auth-hook";

interface MessageListProps
{
    messages: MessageResponseDTO[]; // the array of messages
    loading: boolean;
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
    <div>
        {messages.map( (msg) =>
            {
                const isMine = msg.senderId === user?.id;

                // Here we convert (map) the message DTO to an HTML version of it
                return (
                    <div key={msg.id}>
                        <div>{msg.content}</div>
                        <div>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                );
            }
        )}

        {/* Invisible element used for auto-scroll */}
        <div ref={bottomRef}></div>
    </div>
    );
}