export interface AskRequest {
  question: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  timestamp: string;
}

export interface ChatHistoryItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}
