export enum MessageType {
    Generic = 'Generic',
}

export enum ThreadType {
    Regular = 'Regular',
    RegularGroup = 'RegularGroup',
}

export interface MessageData {
    sender_name: string;
    timestamp_ms: number;
    content: string;
    type: MessageType;
}

export interface ParticipantData {
    name: string;
}

export interface ThreadDataFile {
    messages: MessageData[];
    participants: ParticipantData[];
    title: string;
    is_still_participant: boolean;
    thread_type: ThreadType;
    thread_path: string;
}

export interface FriendData {
    name: string;
    timestamp: number;
    contact_info: string;
}

export interface FriendsDataFile {
    friends: FriendData[];
}

export interface Message {
    thread: number;
    participant: number;
    timestamp: number;
    content: string;
    type: MessageType;
}
export interface Participant {
    id: number;
    name: string;
    friend: FriendData;
}
