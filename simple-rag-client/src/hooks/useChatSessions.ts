import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useChatStore } from '../store/useChatStore';

export interface ChatSession {
  sessionId: string;
  title: string;
  createdAt: string;
}

export interface ApiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChatSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await apiClient.get<ChatSession[]>('/sessions');
      return data;
    },
  });
}

export function useSessionMessages(sessionId: string | null) {
  const setMessages = useChatStore(state => state.setMessages);

  return useQuery({
    queryKey: ['sessions', sessionId, 'messages'],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data } = await apiClient.get<ApiChatMessage[]>(`/sessions/${sessionId}/messages`);
      const parsedData = data.map((msg, idx) => ({
        id: idx.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date() // Fallback timestamp since simple JSON storage does not track per-message timestamps
      }));
      setMessages(parsedData);
      return parsedData;
    },
    enabled: !!sessionId,
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
