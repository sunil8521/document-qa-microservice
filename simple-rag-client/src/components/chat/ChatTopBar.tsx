import { Search, Share2, Bell, ChevronDown, Menu } from 'lucide-react';
import { GiWhiteBook } from 'react-icons/gi';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

export function ChatTopBar() {
  const { user } = useAuthStore();
  const { toggleSidebar, isSidebarOpen } = useChatStore();

  return (
    <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <GiWhiteBook className="w-5 h-5 text-[#2E7D32]" />
          <h1 className="text-[15px] font-bold text-gray-900 font-heading">
            Document Assistant
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
            Chat
          </span>
        </div>
      </div>

      {/* Center search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-100 bg-gray-50/50 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/10 focus:border-[#2E7D32]/30 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2E7D32] rounded-full" />
        </button>
        <div className="h-5 w-px bg-gray-100 mx-1" />
        <button className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name || 'User'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
