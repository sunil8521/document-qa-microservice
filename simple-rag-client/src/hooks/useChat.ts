import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useChatStore } from '../store/useChatStore';

export function useChatMutation() {
  const addMessage = useChatStore((state) => state.addMessage);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, sessionId }: { message: string, sessionId?: string | null }) => {
      const response = await apiClient.post('/chat', { message, sessionId });
      return response.data;
    },
    onSuccess: (data) => {
      // Add AI response to messages
      addMessage({
        id: Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      });
      // Refresh sidebar sessions list (new session may have been created)
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });
}
