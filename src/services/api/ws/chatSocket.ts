import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthHook } from "../../auth/use-auth-hook";

type IncomingPrivate =
{
    type: "private";
    from: number;
    to: number;
    content: string;
}

type IncomingOnLine =
{
    type: "onlineUsers";
    users: number[];
}

type Incoming = IncomingPrivate | IncomingOnLine | { [k: string]: any };

type MessageHandler = (msg: Incoming) => void;

const WS_PATH = "/ws";

/* Special hook for React:
** - opens a WebSocket at ws://<host>/ws?token=... using VITE_API_URL to compute origin
** - re-opens when accessToken changes (so after login it will connect)
** - exposes sendPrivate(to, content) to send messages
** - lets components register message handlers with addMessageHandler(h); handlers are called for all incoming messages
** - maintains onlineUsers state from server type: "onlineUsers" messages
** - attempts simple reconnection with backoff */
export function useChatSocket()
{
    const {accessToken, user, isAuthenticated} = useAuthHook();
    const [connected, setConnected] = useState<boolean>(false);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef<Set<MessageHandler>>(new Set<MessageHandler>());
    const reconnectRef = useRef<number>(0);
    const backoffRef = useRef(1000);

    // Register/unregister message handlers
    const addMessageHandler = useCallback( (handler: MessageHandler) => 
        {
            handlersRef.current.add(handler);

            return () => handlersRef.current.delete(handler);
        },
        []
    );

    // Send JSON helper
    const sendJson = useCallback( (obj: any) =>
        {
            const webSocket = wsRef.current;
            if (!webSocket || webSocket.readyState !== WebSocket.OPEN)
                throw new Error("Socket is not open!");

            webSocket.send(JSON.stringify(obj));
        },
        []
    );

    // Function to send private message
    const sendPrivate = useCallback( (to: number, content: string) =>
        {
            sendJson({type: "private", to, content});
        },
        [sendJson]
    );

    // Build Web Socket URL from Vite URL
    const buildWsUrl = useCallback( () =>
        {
            // VITE_API_URL could look like "http://localhost:8080" or "http://localhost:8080/api"
            const base = (import.meta.env.VITE_API_URL as string) || "";
            
            // Strip path part: keep origin only
            try
            {
                const url = new URL(base);

                // Here we choose Web Sockets (ws) or Web Sockets Secure (wss)
                let protocol = "";
                if (url.protocol === "https:")
                    protocol = "wss";
                else
                    protocol = "ws";

                const origin = `${protocol}//${url.host}`;

                // Build final URL in the expected form of: ?token=...
                const token = accessToken ?? "";
                return `${origin}${WS_PATH}?token=${encodeURIComponent(token)}`;
            }
            catch
            {
                // Fallback solution for building URL
                const token = accessToken ?? "";
                return `${WS_PATH}?token=${encodeURIComponent(token)}`;
            }
        },
        [accessToken]
    );

    // Open/reconnect logic
    useEffect( () =>
        {
            // First, if user is not authenticated, then close WebSocket
            if (!isAuthenticated || !accessToken)
            {
                // Close Web Socket if open
                wsRef.current?.close();
                wsRef.current = null;

                setConnected(false);
                return;
            }

            let didCancel = false;
            const url = buildWsUrl();
            let ws: WebSocket;

            try
            {
                ws = new WebSocket(url);
                wsRef.current = ws;
            }
            catch (error: any)
            {
                console.error(`Connecting to WebSocket failed: ${error}`);
                return;
            }

            // Handler/callback for when the connection is established
            ws.onopen = () =>
            {
                if (didCancel)
                    return;

                reconnectRef.current = 0;
                backoffRef.current = 1000;
                setConnected(true);

                console.log("WebSocket connected");
            };

            // Handler/callback for sending messages
            ws.onmessage = (evt) =>
            {
                try
                {
                    const data = JSON.parse(evt.data);

                    // Handle known types
                    if (data?.type === "onlineUsers" && Array.isArray(data.users))
                        setOnlineUsers(data.users);

                    // Notify handlers
                    handlersRef.current.forEach( (header) =>
                    {
                        try
                        { header(data); }
                        catch (error: any)
                        { console.error(error); }
                    });
                }
                catch (error: any)
                { console.error(`Invalid WS json: ${error}`); }
            };

            // Handler/callback for when the connection closes
            ws.onclose = () =>
            {
                setConnected(false);
                wsRef.current = null;

                if (didCancel)
                    return;

                // Reconnect with backoff
                reconnectRef.current += 1;
                const wait = Math.min(30000, backoffRef.current);
                backoffRef.current = Math.min(30000, backoffRef.current * 1.5);
                console.log(`WS closed, reconnecting in ${wait} ms`);
                setTimeout( () =>
                {
                    if (!didCancel)
                    {
                        try
                        {
                            const newWs = new WebSocket(buildWsUrl());
                            wsRef.current = newWs;
                        }
                        catch (error: any)
                        {
                            console.error(`reconnect failed: ${error}`);
                        }
                    }
                },
                wait);
            };

            // Handler/callback for error
            ws.onerror = (error) =>
            {
                console.error(`WS error: ${error}`);

                // Close in order to trigger recconect
                ws.close();
            };

            return () =>
            {
                didCancel = true;

                try
                { ws.close(); }
                catch (error: any)
                { }

                wsRef.current = null;
                setConnected(false);
            };
        },
        [buildWsUrl, isAuthenticated, accessToken]
    );

    return {
        connected: connected,
        onlineUsers: onlineUsers,
        sendPrivate: sendPrivate,
        addMessageHandler: addMessageHandler,
        close: () => wsRef.current?.close()
    };
}