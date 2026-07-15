import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatArea } from '../components/chat/ChatArea';

export function ChatDashboard() {
  return (
    <div className="h-dvh flex overflow-hidden bg-[#fafbfa]">
      {/* Sidebar */}
      <ChatSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ChatArea />
      </div>
    </div>
  );
}
