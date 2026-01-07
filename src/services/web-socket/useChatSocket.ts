import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthHook } from "../auth/use-auth-hook";
// import type { MessageRequestDto } from "../../models/dto/MessageRequestDto";
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
    // const reconnectRef = useRef(0);
    // const backoffRef = useRef(1000);

    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    // Add / remove message handlers
    const addMessageHandler = useCallback((handler: MessageHandler) => {
        handlersRef.current.add(handler);
        return () => handlersRef.current.delete(handler);
    }, []);

    // Send JSON through WebSocket (queue if not open)
    const sendJson = useCallback((data: any) =>
        {
            const socket = wsRef.current; // Get the actual current socket from the ref

            if (socket && socket.readyState === WebSocket.OPEN)
            {
                const payload = JSON.stringify(data);

                console.log(">>> PUSHING BYTES TO HARDWARE:", payload);

                // socket.send(payload);
                socket.send(payload);
            }
            else
            {
                // 2. If it's not open, we log why
                // const state = socket ? socket.readyState : "NULL";
                // console.warn(`WebSocket not ready (State: ${state}). Queuing message.`);
                console.error("SEND FAILURE: wsRef.current is:", wsRef.current ? "CLOSED" : "NULL");
                console.error("STILL NULL - State:", wsRef.current?.readyState);

                // Optional: If socket is closed, you could push to messageQueueRef here
                messageQueueRef.current.push(data);
            }
        }, [] // we don't need to place 'wsRef' here because refs don't change
    );

    // Send a chat message
    const sendMessage = useCallback((receiverId: number, content: string) =>
        {
            console.log("SOCKET SEND:", { receiverId: receiverId, content: content });
            
            sendJson({ senderId: undefined, // The backend determines the sender from the JWT token — not from the client
                        receiverId: receiverId,
                        content: content });
        },
        [sendJson]
    );
    
    // Build Web Socket URL from Vite URL
    const buildWsUrl = useCallback(() =>
        {
            try {
                const token = accessToken ?? "";
                return `${WS_PATH}?token=${encodeURIComponent(token)}`;
            } catch {
                const token = accessToken ?? "";
                return `${WS_PATH}?token=${encodeURIComponent(token)}`;
            }
        },
        [accessToken]
    );

    // Memoize the URL so it only changes when the token actually changes
    const wsUrl = useMemo(() =>
        {
            if (!accessToken) return null;
            return `${WS_PATH}?token=${encodeURIComponent(accessToken)}`;
        },
        [accessToken]
    );

    // The Main WebSocket Effect
    useEffect(() => {
        // If no URL (no token), don't connect
        if (!wsUrl) {
            console.log("No access token available, skipping WS connection.");
            return;
        }

        console.log("Connecting to WebSocket with URL...");
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket OPENED");
            setConnected(true);
            
            // Process queued messages if any
            while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                const msg = messageQueueRef.current.shift();
                wsRef.current.send(JSON.stringify(msg));
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
                        // setOnlineUsers(wsMessage.users || []);
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

                        // Notify all registered handlers
                        handlersRef.current.forEach(handler => handler(dto) );
                        break;
                }
            }
            catch (err) { console.error("Failed to parse WebSocket message:", err); }
        };

        socket.onclose = (e) => {
            console.log("WebSocket CLOSED", e.code);
            setConnected(false);
            if (wsRef.current === socket) wsRef.current = null;
        };

        socket.onerror = (err) => {
            console.error("WS Hardware Error:", err);
        };

        // Cleanup function
        return () => {
            console.log("Cleaning up WebSocket...");
            socket.close();
            if (wsRef.current === socket) wsRef.current = null;
        };
    }, [wsUrl]); // Only reconnects if the URL (token) changes

    return {
        connected,
        onlineUsers,
        sendMessage,
        addMessageHandler,
        close: () => wsRef.current?.close(),
    };
}