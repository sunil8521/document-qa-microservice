import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { name: string; page?: number }[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  status?: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface ChatState {
  messages: ChatMessage[];
  documents: Document[];
  activeSessionId: string | null;
  isSidebarOpen: boolean;
  addMessage: (msg: ChatMessage) => void;
  addDocument: (doc: Document) => void;
  setDocuments: (docs: Document[]) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => void;
  setActiveSession: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  toggleSidebar: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  documents: [],
  activeSessionId: null,
  isSidebarOpen: true,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  addDocument: (doc) => set((state) => {
    if (state.documents.some(d => d.id === doc.id)) return state;
    return { documents: [...state.documents, doc] };
  }),
  setDocuments: (docs) => set({ documents: docs }),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id)
    })),
  updateDocumentStatus: (id, status) => set((state) => ({
    documents: state.documents.map(d => d.id === id ? { ...d, status } : d)
  })),
  setActiveSession: (id) => set({ activeSessionId: id }),
  setMessages: (messages) => set({ messages }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  clearMessages: () => set({ messages: [] }),
}));
