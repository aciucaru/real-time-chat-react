import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthHook } from "../auth/use-auth-hook";

export type IncomingMessage =
{
    from: number;
    to: number;
    content: string;
};

type MessageHandler = (msg: IncomingMessage) => void;

const WS_PATH = "ws://localhost:8080/ws/chat";

/* Special hook for React:
** - opens a WebSocket at ws://<host>/ws?token=... using VITE_API_URL to compute origin
** - re-opens when accessToken changes (so after login it will connect)
** - exposes sendPrivate(to, content) to send messages
** - lets components register message handlers with addMessageHandler(h); handlers are called for all incoming messages
** - maintains onlineUsers state from server type: "onlineUsers" messages
** - attempts simple reconnection with backoff */
export function useChatSocket() {
    const { accessToken, isAuthenticated } = useAuthHook();

    const wsRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef<Set<MessageHandler>>(new Set());
    const messageQueueRef = useRef<any[]>([]);
    const reconnectRef = useRef(0);
    const backoffRef = useRef(1000);

    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    // Add / remove message handlers
    const addMessageHandler = useCallback((handler: MessageHandler) => {
        handlersRef.current.add(handler);
        return () => handlersRef.current.delete(handler);
    }, []);

    // Send JSON through WebSocket (queue if not open)
    const sendJson = useCallback((obj: any) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            messageQueueRef.current.push(obj);
            return;
        }

        ws.send(JSON.stringify(obj));
    }, []);

    // Send a chat message
    const sendMessage = useCallback((to: number, content: string) =>
        {
            console.log("SOCKET SEND:", { to, content });
            
            sendJson({ from: undefined, to, content });
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

    // Connect WebSocket
    useEffect(() =>
        {
            if (!isAuthenticated || !accessToken)
            {
                wsRef.current?.close();
                wsRef.current = null;
                setConnected(false);
                return;
            }

            let didCancel = false;

            const connect = () =>
            {
                const url = buildWsUrl();
                if (!url) return;

                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () =>
                {
                    if (didCancel) return;
                    setConnected(true);

                    while (messageQueueRef.current.length > 0) {
                        ws.send(JSON.stringify(messageQueueRef.current.shift()));
                    }

                    reconnectRef.current = 0;
                    backoffRef.current = 1000;
                };

                ws.onmessage = (evt) =>
                {
                    console.log("WS RAW:", evt.data);

                    try
                    {
                        const data = JSON.parse(evt.data);

                        // still allow online user notifications
                        if (data?.type === "onlineUsers" && Array.isArray(data.users)) {
                            setOnlineUsers(data.users);
                            return;
                        }

                        // treat everything else as a chat message
                        if (typeof data?.from === "number" &&
                            typeof data?.to === "number" &&
                            typeof data?.content === "string")
                        {
                            handlersRef.current.forEach(handler =>
                            {
                                console.log("DISPATCH TO HANDLER:", data);

                                handler(data);
                            });
                        }
                    }
                    catch (e)
                    { console.error("Invalid WS message:", e); }
                };

                ws.onclose = () =>
                {
                    setConnected(false);
                    wsRef.current = null;

                    if (didCancel) return;

                    const wait = Math.min(30000, backoffRef.current);
                    backoffRef.current = Math.min(30000, backoffRef.current * 1.5);

                    setTimeout(connect, wait);
                };

                ws.onerror = (err) =>
                {
                    console.error("WS error", err);
                    ws.close();
                };
            };

            connect();

            return () => {
                didCancel = true;
                wsRef.current?.close();
                wsRef.current = null;
                setConnected(false);
            };
        },
        [buildWsUrl, accessToken, isAuthenticated]
    );

    return {
        connected,
        onlineUsers,
        sendMessage,
        addMessageHandler,
        close: () => wsRef.current?.close(),
    };
}