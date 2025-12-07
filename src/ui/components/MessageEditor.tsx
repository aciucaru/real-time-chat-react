import { useState } from "react";

import styles from "./MessageEditor.module.css";

interface MessageEditorProps
{
    onSend: (content: string) => Promise<void>;
}

export default function MessageEditor({onSend}: MessageEditorProps)
{
    const [content, setContent] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () =>
    {
        // If the message is empty, then don't return anything, to prevent displaying
        // empty messages
        if (!content.trim())
            return;

        setIsSending(true);
        setError(null);

        try
        {
            await onSend(content.trim());
            setContent(""); // Clear input
        }
        catch (error: any)
        { setError(error?.message || "Error sending message"); }
        finally
        { setIsSending(false); }
    };

    /* This function allows the user to send a message more naturally, by pressing Enter.
    ** We attach this function to an <input> element.
    ** It bassically detects wheter the user has pressed Enter (but without pressing Shift).
    ** Shift + Enter is allowed, because it means the user is trying to add a new line, not
    ** to send the message. */
    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) =>
    {
        // If the user is only pressing Enter (not Shift + Enter), then he wants to send the message
        if (event.key === "Enter" && !event.shiftKey)
        {
            event.preventDefault();

            // Send message
            handleSend();
        }
    };

    return (
        <div className={`${styles.mainContainer}`}>
            <textarea
                className={`${styles.messageEditor}`}
                value={content}
                placeholder="Write a message…"
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={isSending}
            ></textarea>

            <button
            onClick={handleSend}
            disabled={isSending || !content.trim()}
            >
                {isSending ? "Sending…" : "Send"}
            </button>

            {error && <div>{error}</div>}
        </div>
    );
}