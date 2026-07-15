import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, User, FileText, ExternalLink, Menu, Loader2 } from 'lucide-react';
import { GiWhiteBook } from 'react-icons/gi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChatStore, type ChatMessage } from '../../store/useChatStore';
import { useChatMutation } from '../../hooks/useChat';
import { useSessionMessages } from '../../hooks/useChatSessions';

export function ChatArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams(); // From URL /c/:sessionId
  const { messages, addMessage, toggleSidebar, setActiveSession, clearMessages } = useChatStore();

  // Load session messages from API using TanStack Query
  const { isLoading: isLoadingHistory } = useSessionMessages(sessionId || null);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatMutation = useChatMutation();

  // Sync URL sessionId with store
  useEffect(() => {
    if (sessionId) {
      if (location.state?.skipFetch) {
        // We just created this chat — don't wipe UI. Clear the router state for refresh.
        navigate(`/c/${sessionId}`, { replace: true, state: {} });
      } else {
        // Switching to an existing session — clear old messages from UI
        clearMessages();
      }
      setActiveSession(sessionId);
    } else {
      // /chat — new chat mode
      setActiveSession(null);
      clearMessages();
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput('');

    if (!sessionId) {
      // We're on /chat (new chat) — mutate will auto-create session
      chatMutation.mutate({ message: trimmed, sessionId: null }, {
        onSuccess: (data) => {
          if (data.sessionId) {
            // Navigate to /c/:sessionId with skipFetch so useEffect doesn't wipe messages
            navigate(`/c/${data.sessionId}`, { state: { skipFetch: true } });
          }
        },
        onError: () => {
          addMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Sorry, I couldn\'t process your request. Please try again.',
            timestamp: new Date(),
          });
        }
      });
    } else {
      // Already inside /c/:sessionId
      chatMutation.mutate({ message: trimmed, sessionId }, {
        onError: () => {
          addMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Sorry, I couldn\'t process your request. Please try again.',
            timestamp: new Date(),
          });
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fafbfa] overflow-hidden">
      {/* Mobile top bar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 shrink-0 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-8">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {chatMutation.isPending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <GiWhiteBook className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-5 py-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white px-4 sm:px-6 lg:px-16 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50/80 rounded-2xl border border-gray-100 px-4 py-3 focus-within:ring-2 focus-within:ring-[#2E7D32]/10 focus-within:border-[#2E7D32]/30 transition-all">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors shrink-0 mb-0.5">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none resize-none min-h-[24px] max-h-[150px] leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="p-2.5 rounded-xl bg-[#2E7D32] text-white hover:bg-[#1B5E20] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 hover:shadow-lg hover:shadow-green-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-gray-300 text-center mt-2.5">
            RAG Book can make mistakes. Verify important information from source documents.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <GiWhiteBook className="w-7 h-7 sm:w-8 sm:h-8 text-[#2E7D32]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-gray-900 mb-2">
          Start a Conversation
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-6 sm:mb-8">
          Upload your documents in the sidebar, then ask questions about them.
          I'll find the most relevant information and respond with citations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {[
            'Summarize the key points',
            'What are the main themes?',
            'Compare these documents',
            'Extract action items',
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="text-left text-[13px] text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-[#2E7D32]/20 hover:bg-[#E8F5E9]/30 hover:text-[#1B5E20] transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser
          ? 'bg-gradient-to-br from-[#2E7D32] to-[#66BB6A]'
          : 'bg-[#E8F5E9]'
          }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <GiWhiteBook className="w-4 h-4 text-[#2E7D32]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] ${isUser
          ? 'bg-[#2E7D32] text-white rounded-2xl rounded-tr-md px-5 py-3.5'
          : 'bg-white text-gray-800 rounded-2xl rounded-tl-md px-5 py-4 border border-gray-100 shadow-sm'
          }`}
      >
        <div className="text-[14px] leading-[1.7]">
          <MarkdownRenderer content={message.content} />
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Citations
            </p>
            <div className="space-y-1.5">
              {message.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[#f8faf8] rounded-lg px-3 py-2"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className="text-[12px] text-gray-600 flex-1 truncate">
                    {src.name}
                    {src.page ? `, pg ${src.page}` : ''}
                  </span>
                  <button className="text-[11px] font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-2 ${isUser ? 'text-white/50' : 'text-gray-300'
            }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Markdown Renderer ─── */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 bg-gray-100 rounded text-red-600 font-mono text-[12px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <ul key={lineIdx} className="list-disc list-inside ml-2 my-0.5">
              <li>{parseInline(trimmed.substring(2))}</li>
            </ul>
          );
        }
        if (trimmed === '') {
          return <div key={lineIdx} className="h-1.5" />;
        }
        return <p key={lineIdx} className="whitespace-pre-wrap">{parseInline(line)}</p>;
      })}
    </div>
  );
}
