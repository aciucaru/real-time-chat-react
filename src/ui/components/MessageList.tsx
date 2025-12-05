import type { MessageResponseDTO } from "../../models/dto/MessageResponseDTO";
import { useAuthHook } from "../../services/auth/use-auth-hook";

interface MessageListProps
{
    messages: MessageResponseDTO;
    loading: boolean;
    error: string | null;
}

export default function MessageList(
    {
        messages,
        laoding,
        error
    }: MessageListProps
)
{
    const { user } = useAuthHook();
    const bottomRef = useRef<HTMLDivElement | null>(null);
    return (
        <div>List</div>
    );
}