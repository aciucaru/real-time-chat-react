import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthHook } from "../auth/use-auth-hook";

export type IncomingPrivate =
{
    // type: "private";
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

const WS_PATH = "ws://localhost:8080/ws/chat";

/* Special hook for React:
** - opens a WebSocket at ws://<host>/ws?token=... using VITE_API_URL to compute origin
** - re-opens when accessToken changes (so after login it will connect)
** - exposes sendPrivate(to, content) to send messages
** - lets components register message handlers with addMessageHandler(h); handlers are called for all incoming messages
** - maintains onlineUsers state from server type: "onlineUsers" messages
** - attempts simple reconnection with backoff */
// export function useChatSocket()
// {
//     const {accessToken, user, isAuthenticated} = useAuthHook();
//     const [connected, setConnected] = useState<boolean>(false);
//     const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
//     const wsRef = useRef<WebSocket | null>(null);
//     const handlersRef = useRef<Set<MessageHandler>>(new Set<MessageHandler>());
//     const reconnectRef = useRef<number>(0);
//     const backoffRef = useRef(1000);
//     const messageQueueRef = useRef<any[]>([]);

//     // Register/unregister message handlers
//     const addMessageHandler = useCallback( (handler: MessageHandler) => 
//         {
//             handlersRef.current.add(handler);

//             return () => handlersRef.current.delete(handler);
//         },
//         []
//     );

//     // Send JSON helper
//     const sendJson = useCallback((obj: any) =>
//         {
//             const webSocket = wsRef.current;

//             if (!webSocket || webSocket.readyState !== WebSocket.OPEN)
//             {
//                 // Queue message
//                 messageQueueRef.current.push(obj);

//                 return;
//             }

//             webSocket.send(JSON.stringify(obj));
//         },
//         []
//     );

//     // Function to send private message
//     const sendPrivate = useCallback( (to: number, content: string) =>
//         {
//             sendJson({type: "private", to, content});
//         },
//         [sendJson]
//     );

//     // Build Web Socket URL from Vite URL
//     const buildWsUrl = useCallback( () =>
//         {
//             // VITE_API_URL could look like "http://localhost:8080" or "http://localhost:8080/api"
//             const base = (import.meta.env.VITE_API_URL as string) || "";
            
//             // Strip path part: keep origin only
//             try
//             {
//                 const url = new URL(base);

//                 // Here we choose Web Sockets (ws) or Web Sockets Secure (wss)
//                 let protocol = "";
//                 if (url.protocol === "https:")
//                     protocol = "wss";
//                 else
//                     protocol = "ws";

//                 const origin = `${protocol}//${url.host}`;

//                 // Build final URL in the expected form of: ?token=...
//                 const token = accessToken ?? "";
//                 return `${WS_PATH}?token=${encodeURIComponent(token)}`;
//             }
//             catch
//             {
//                 // Fallback solution for building URL
//                 const token = accessToken ?? "";
//                 return `${WS_PATH}?token=${encodeURIComponent(token)}`;
//             }
//         },
//         [accessToken]
//     );

//     // Open/reconnect logic
//     useEffect( () =>
//         {
//             // First, if user is not authenticated, then close WebSocket
//             if (!isAuthenticated || !accessToken)
//             {
//                 // Close Web Socket if open
//                 wsRef.current?.close();
//                 wsRef.current = null;

//                 setConnected(false);
//                 return;
//             }

//             let didCancel = false;
//             const url = buildWsUrl();
//             console.log("Connecting to WebSocket:", url);

//             let ws: WebSocket;

//             try
//             {
//                 ws = new WebSocket(url);
//                 wsRef.current = ws;
//             }
//             catch (error: any)
//             {
//                 console.error(`Connecting to WebSocket failed: ${error}`);
//                 return;
//             }

//             // Handler/callback for when the connection is established
//             ws.onopen = () =>
//             {
//                 if (didCancel)
//                     return;

//                 reconnectRef.current = 0;
//                 backoffRef.current = 1000;
//                 setConnected(true);

//                 console.log("WebSocket connected");
//             };

//             // Handler/callback for sending messages
//             ws.onmessage = (evt) =>
//             {
//                 try
//                 {
//                     const data = JSON.parse(evt.data);

//                     // Handle known types
//                     if (data?.type === "onlineUsers" && Array.isArray(data.users))
//                         setOnlineUsers(data.users);

//                     // Notify handlers
//                     handlersRef.current.forEach( (header) =>
//                     {
//                         try
//                         { header(data); }
//                         catch (error: any)
//                         { console.error(error); }
//                     });
//                 }
//                 catch (error: any)
//                 { console.error(`Invalid WS json: ${error}`); }
//             };

//             // Handler/callback for when the connection closes
//             ws.onclose = () =>
//             {
//                 setConnected(false);
//                 wsRef.current = null;

//                 if (didCancel)
//                     return;

//                 // Reconnect with backoff
//                 reconnectRef.current += 1;
//                 const wait = Math.min(30000, backoffRef.current);
//                 backoffRef.current = Math.min(30000, backoffRef.current * 1.5);
//                 console.log(`WS closed, reconnecting in ${wait} ms`);
//                 setTimeout( () =>
//                 {
//                     if (!didCancel)
//                     {
//                         try
//                         {
//                             const newWs = new WebSocket(buildWsUrl());
//                             wsRef.current = newWs;
//                         }
//                         catch (error: any)
//                         {
//                             console.error(`reconnect failed: ${error}`);
//                         }
//                     }
//                 },
//                 wait);
//             };

//             // Handler/callback for error
//             ws.onerror = (error) =>
//             {
//                 console.error(`WS error: ${error}`);

//                 // Close in order to trigger recconect
//                 ws.close();
//             };

//             return () =>
//             {
//                 didCancel = true;

//                 try
//                 { ws.close(); }
//                 catch (error: any)
//                 { }

//                 wsRef.current = null;
//                 setConnected(false);
//             };
//         },
//         [buildWsUrl, isAuthenticated, accessToken]
//     );

//     return {
//         connected: connected,
//         onlineUsers: onlineUsers,
//         sendPrivate: sendPrivate,
//         addMessageHandler: addMessageHandler,
//         close: () => wsRef.current?.close()
//     };
// }

/* Special hook for React:
** - opens a WebSocket at ws://<host>/ws?token=... using VITE_API_URL to compute origin
** - re-opens when accessToken changes (so after login it will connect)
** - exposes sendPrivate(to, content) to send messages
** - lets components register message handlers with addMessageHandler(h); handlers are called for all incoming messages
** - maintains onlineUsers state from server type: "onlineUsers" messages
** - attempts simple reconnection with backoff */
export function useChatSocket() {
    const { accessToken, user, isAuthenticated } = useAuthHook();

    const wsRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef<Set<MessageHandler>>(new Set());
    const messageQueueRef = useRef<any[]>([]);
    const reconnectRef = useRef(0);
    const backoffRef = useRef(1000);

    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    // Add / remove message handlers
    const addMessageHandler = useCallback((handler: MessageHandler) =>
        {
            handlersRef.current.add(handler);
            return () => handlersRef.current.delete(handler);
        },
        []
    );

    // Send JSON through WebSocket (queue if not open)
    const sendJson = useCallback((obj: any) =>
        {
            const ws = wsRef.current;

            if (!ws || ws.readyState !== WebSocket.OPEN) {
                messageQueueRef.current.push(obj);
                return;
            }

            ws.send(JSON.stringify(obj));
        },
        []
    );

    // Send a private message
    const sendPrivate = useCallback(
        (to: number, content: string) => {
            sendJson({ type: "private", to, content });
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

                // const origin = `${protocol}//${url.host}`;

                // Build final URL in the expected form of: ?token=...
                const token = accessToken ?? "";
                return `${WS_PATH}?token=${encodeURIComponent(token)}`;
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

    // Connect WebSocket
    useEffect(() =>
        {
            if (!isAuthenticated || !accessToken) {
                wsRef.current?.close();
                wsRef.current = null;
                setConnected(false);
                return;
            }

            let didCancel = false;

            const connect = () => {
                const url = buildWsUrl();
                if (!url) return;

                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (didCancel) return;

                    console.log("WebSocket connected");
                    setConnected(true);

                    // Flush queued messages
                    while (messageQueueRef.current.length > 0) {
                        const msg = messageQueueRef.current.shift();
                        ws.send(JSON.stringify(msg));
                    }

                    reconnectRef.current = 0;
                    backoffRef.current = 1000;
                };

                // ws.onmessage = (evt) => {
                //     try {
                //         const data = JSON.parse(evt.data);

                //         if (data?.type === "onlineUsers" && Array.isArray(data.users)) {
                //             setOnlineUsers(data.users);
                //         }

                //         handlersRef.current.forEach((handler) => {
                //             try {
                //                 handler(data);
                //             } catch (err) {
                //                 console.error(err);
                //             }
                //         });
                //     } catch (err) {
                //         console.error("Invalid WS JSON:", err);
                //     }
                // };
                ws.onmessage = (evt) =>
                {
                    const data = JSON.parse(evt.data);

                    if (data?.type === "onlineUsers")
                        setOnlineUsers(data.users);
                    else if (data?.content && data?.from)
                        // treat it as a chat message
                        handlersRef.current.forEach(handler => handler(data));
                };

                ws.onclose = () => {
                    setConnected(false);
                    wsRef.current = null;

                    if (didCancel) return;

                    // Reconnect with backoff
                    reconnectRef.current += 1;
                    const wait = Math.min(30000, backoffRef.current);
                    backoffRef.current = Math.min(30000, backoffRef.current * 1.5);

                    console.log(`WS closed, reconnecting in ${wait}ms`);
                    setTimeout(connect, wait);
                };

                ws.onerror = (err) => {
                    console.error("WS error:", err);
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
        sendPrivate,
        addMessageHandler,
        close: () => wsRef.current?.close(),
    };
}