export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  expiresAt: number;
  isOwn?: boolean;
  isEdited?: boolean;
}

export interface TypingUser {
  username: string;
  timestamp: number;
}