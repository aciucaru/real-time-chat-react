/* Enum-like type which describes the possible type of messages that this application
** sends through WebSockets:
** - CHAT: the message sent through WebSockets is a single chat message
** - ONLINE_USERS: the message sent through WebSockets is an array of users IDs, like [1, 2, 3, 4]
*/
export type WsMessageKind = "CHAT" | "ONLINE_USERS";

/* This class represents a WebSockets message that can have different types of payloads (the T generic type). */
export interface WsMessageDto<T>
{
    kind: WsMessageKind;
    payload: T;
}