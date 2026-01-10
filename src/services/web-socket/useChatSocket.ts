import { useEffect, useRef, useState } from "react";
import { useAuthHook } from "../auth/use-auth-hook";
import type { MessageResponseDto } from "../../models/dto/MessageResponseDto";
import type { WsMessageDto } from "../../models/dto/WsMessageDto";
import type { OnlineUsersDto } from "../../models/dto/OnlineUsersDto";

type MessageHandler = (msg: MessageResponseDto) => void;

const WS_PATH = "ws://localhost:8080/ws/chat";

/* Special hook for React:
** - opens a WebSocket at ws://<host>/ws?token=... using VITE_API_URL to compute origin
** - re-opens when accessToken changes (so after login it will connect)
** - exposes sendPrivate(to, content) to send messages
** - lets components register message handlers with addMessageHandler(h); handlers are called for all incoming messages
** - maintains onlineUsers state from server type: "onlineUsers" messages
** - attempts simple reconnection with backoff */
export function useChatSocket()
{
    const { accessToken, isAuthenticated } = useAuthHook();

    const wsRef = useRef<WebSocket | null>(null);

    const handlersRef = useRef<Set<MessageHandler>>(new Set());
    const messageQueueRef = useRef<any[]>([]);

    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    // Add / remove message handlers
    const addMessageHandler = (handler: MessageHandler) =>
    {
        handlersRef.current.add(handler);

        return () => {
            handlersRef.current.delete(handler);
        };
    };

    const close = () =>
    {
        wsRef.current?.close();
        wsRef.current = null;
    };

    // Send a chat message
    const sendMessage = (receiverId: number, content: string) =>
    {
        if (wsRef.current?.readyState === WebSocket.OPEN)
        {
            wsRef.current.send( JSON.stringify({ receiverId, content }) );
        }
        else
            console.warn("Attempted send while WS not open");
    };
    
    // The Main WebSocket Effect
    useEffect(() =>
    {
        // If no token, don't connect
        if (!accessToken || !isAuthenticated)
        {
            console.log("No access token available, skipping WS connection.");
            return;
        }

        // Prevent multiple connections
        if (wsRef.current?.readyState === WebSocket.OPEN || 
            wsRef.current?.readyState === WebSocket.CONNECTING)
        {
            console.log("WebSocket already exists, skipping creation");
            return;
        }

        console.log("Opening WebSocket with token", accessToken);
        const socket = new WebSocket(`${WS_PATH}?token=${accessToken}`);
        wsRef.current = socket;

        socket.onopen = () =>
        {
            console.log("WebSocket OPENED");
            setConnected(true);
            
            // Flush any queued messages
            while (messageQueueRef.current.length > 0) {
                const msg = messageQueueRef.current.shift();
                socket.send(JSON.stringify(msg));
            }
        };

        // Actual message processing
        socket.onmessage = (event) =>
        {
            try
            {
                const wsMessage = JSON.parse(event.data) as WsMessageDto<any>;
                console.log("WebSocket received:", wsMessage);

                switch (wsMessage.kind)
                {
                    case "ONLINE_USERS":
                        setOnlineUsers((wsMessage.payload as OnlineUsersDto).users ?? []);
                        break;
                    case "CHAT":
                        const payload = wsMessage.payload as MessageResponseDto;

                        const dto: MessageResponseDto = {
                            id: payload.id ?? "ws-" + Date.now(),
                            senderId: payload.senderId,
                            receiverId: payload.receiverId,
                            content: payload.content,
                            timestamp: payload.timestamp ?? new Date().toISOString()
                        };

                        handlersRef.current.forEach(handler => handler(dto) );
                        break;

                    default:
                        console.warn("Unknown WebSockets message kind", wsMessage);
                }
            }
            catch (err)
            { console.error("Failed to parse WebSocket message:", err); }
        };

        socket.onclose = (evt) =>
        {
            console.log("WebSocket CLOSED", evt.code);
            setConnected(false);
            
            // We do not clear wsRef immediately to prevent rapid reconnections
            setTimeout(() =>
            {
                if (wsRef.current === socket)
                    wsRef.current = null;
            }, 1000);
        };

        socket.onerror = (err) =>
        {
            console.error("WS Hardware Error:", err);
        };

        // Cleanup function - only close if component is truly unmounting
        return () => {
            console.log("Cleaning up WebSocket...");
            
            // In production mode, close the socket
            if (import.meta.env.PROD)
                socket.close();
        };
    }, [accessToken, isAuthenticated]);


    return {
        connected,
        onlineUsers,
        sendMessage,
        addMessageHandler,
        close: close,
    };
}