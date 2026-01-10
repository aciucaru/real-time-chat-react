import { useEffect, useState, type ReactNode } from "react";
// import { useAuthHook } from "../auth/use-auth-hook";

import { ChatContext } from "./chat-context";
import { useChatSocket } from "./useChatSocket";

export function ChatProvider({ children }: { children: ReactNode })
{
    const chat = useChatSocket();

    // const { accessToken, isAuthenticated } = useAuthHook();
    // const [socket, setSocket] = useState<WebSocket | null>(null);

    // // open socket whenever authenticated
    // useEffect(() => {
    //     if (!isAuthenticated || !accessToken)
    //     {
    //         // if user logs out → close socket
    //         if (socket)
    //         {
    //             socket.close();
    //             setSocket(null);
    //         }

    //         return;
    //     }

    //     const ws = new WebSocket(`wss://your-url?token=${accessToken}`);
    //     setSocket(ws);

    //     return () => { ws.close(); };
    //     },
    //     [isAuthenticated, accessToken]
    // );

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
}