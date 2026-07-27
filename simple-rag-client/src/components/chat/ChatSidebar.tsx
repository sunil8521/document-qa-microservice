import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, Trash2, Upload,
  LogOut, X, Loader2, AlertCircle
} from 'lucide-react';
import { GiWhiteBook } from 'react-icons/gi';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useChatStore, type Document } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogoutMutation } from '../../hooks/useAuth';
import { useDocumentUpload, useDocumentStatus, useUserDocuments, useDeleteDocumentMutation } from '../../hooks/useDocuments';
import { useChatSessions, useDeleteSessionMutation } from '../../hooks/useChatSessions';
import toast from 'react-hot-toast';

function DocumentListItem({
  doc,
  updateDocumentStatus,
  onDelete,
}: {
  doc: Document;
  updateDocumentStatus: (id: string, status: any) => void;
  onDelete: (id: string) => void;
}) {
  // Only poll for documents that are still being processed (not terminal states)
  const needsPolling = doc.status !== 'COMPLETED' && doc.status !== 'FAILED';
  const { data: statusData } = useDocumentStatus(needsPolling ? Number(doc.id) : undefined);

  useEffect(() => {
    if (statusData?.status && statusData.status !== doc.status) {
      updateDocumentStatus(doc.id, statusData.status);
      if (statusData.status === 'COMPLETED') {
        toast.success(`${doc.name} is ready!`);
      } else if (statusData.status === 'FAILED') {
        toast.error(`${doc.name} processing failed`);
      }
    }
  }, [statusData?.status, doc.id, doc.status, doc.name, updateDocumentStatus]);

  const isFailed = doc.status === 'FAILED';
  const isProcessing = doc.status === 'PROCESSING' || doc.status === 'UPLOADED';

  return (
    <li className="relative">
      <div
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
          isFailed 
            ? 'bg-red-50 text-red-600'
            : isProcessing
            ? 'text-gray-400 bg-gray-50/50'
            : 'text-gray-600'
        }`}
      >
        <div className="shrink-0">
          {isFailed ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : isProcessing ? (
            <Loader2 className="w-4 h-4 text-[#2E7D32] animate-spin" />
          ) : (
            <FileText className="w-4 h-4 text-[#2E7D32]" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <p className={`text-[13px] font-medium truncate ${isFailed ? 'text-red-700' : ''}`}>{doc.name}</p>
          <p className={`text-[10px] mt-0.5 ${isFailed ? 'text-red-400' : 'text-gray-400'}`}>
            {isFailed ? 'Processing Failed' : isProcessing ? 'Processing...' : doc.size}
          </p>
        </div>
      </div>

      {!isProcessing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc.id);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </li>
  );
}

export function ChatSidebar() {
  const {
    documents,
    removeDocument,
    addDocument,
    setDocuments,
    updateDocumentStatus,
    isSidebarOpen,
    toggleSidebar,
  } = useChatStore();

  const user = useAuthStore((state: any) => state.user);
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    // Close sidebar by default on mobile screens (width < 768) on initial load
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  }, []);

  const { data: userDocs } = useUserDocuments();

  useEffect(() => {
    if (userDocs && userDocs.length > 0 && documents.length === 0) {
      const formattedDocs: Document[] = userDocs.map((d: any) => ({
        id: d.id.toString(),
        name: d.fileName,
        type: d.fileType || 'unknown',
        size: `${(d.fileSize / 1024).toFixed(1)} KB`,
        uploadedAt: new Date(d.uploadTime),
        status: d.status
      }));
      setDocuments(formattedDocs);
    }
  }, [userDocs, documents.length, setDocuments]);

  const { uploadFile } = useDocumentUpload();
  const deleteDocMutation = useDeleteDocumentMutation();

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocMutation.mutateAsync(Number(id));
      removeDocument(id);
      toast.success('Document deleted');
    } catch (e) {
      console.error(e);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{id: string, name: string, size: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sessions, isLoading: isLoadingSessions } = useChatSessions();
  const deleteSessionMutation = useDeleteSessionMutation();

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const processFile = async (file: File) => {
    const tempId = `upload-${Date.now()}-${file.name}`;
    const tempSize = `${(file.size / 1024).toFixed(1)} KB`;
    const tempFile = { id: tempId, name: file.name, size: tempSize };
    
    setUploadingFiles(prev => [...prev, tempFile]);

    try {
      const documentId = await uploadFile(file);
      const doc: Document = {
        id: documentId.toString(),
        name: file.name,
        type: file.type || 'unknown',
        size: tempSize,
        uploadedAt: new Date(),
        status: 'PROCESSING'
      };
      addDocument(doc);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
    }
  };

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        processFile(file);
      });
    },
    [addDocument, uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        processFile(file);
      });
      e.target.value = '';
    },
    [addDocument, uploadFile]
  );

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/')
    });
  };

  const closeMobile = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col w-[272px]">
      {/* Logo + close (mobile) */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <GiWhiteBook className="w-7 h-7 text-[#2E7D32] group-hover:text-[#1B5E20] transition-colors" />
          <span className="font-heading text-lg font-extrabold tracking-tight text-gray-900 group-hover:text-[#1B5E20] transition-colors">
            RAG Book<span className="text-[#2E7D32]">.</span>
          </span>
        </Link>
        {/* Close button — only visible on mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload area — drag & drop zone */}
      <div className="px-4 pb-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${isDragging
            ? 'border-[#2E7D32] bg-[#E8F5E9]/50'
            : 'border-gray-200 hover:border-[#2E7D32]/40 hover:bg-[#E8F5E9]/20'
            }`}
        >
          <div className="flex flex-col items-center py-5 gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-[#2E7D32] text-white' : 'bg-[#E8F5E9] text-[#2E7D32]'
              }`}>
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-700">
                {isDragging ? 'Drop here!' : 'Upload Document'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Drag & drop or click • PDF, TXT, DOCX
              </p>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.docx"
          multiple
          onChange={handleFileSelect}
        />
      </div>

      <div className="px-4 pb-3">
        <button 
          onClick={() => {
            navigate('/chat');
            closeMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[13px] font-medium rounded-xl transition-colors"
        >
          <span>+ New Chat</span>
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 mb-2 max-h-[35%]">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 px-2 pt-1 pb-2">
          Chats
        </span>
        {isLoadingSessions ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>
        ) : sessions?.length === 0 ? (
          <div className="text-center py-4 text-[12px] text-gray-400">No chats yet</div>
        ) : (
          <ul className="space-y-1">
            {sessions?.map((session) => (
              <li key={session.sessionId} className="relative group">
                <button
                  onClick={() => {
                    navigate(`/c/${session.sessionId}`);
                    closeMobile();
                  }}
                  className={`w-full text-left px-3 py-2 text-[13px] rounded-lg truncate pr-8 transition-colors ${
                    urlSessionId === session.sessionId
                      ? 'bg-[#E8F5E9] text-[#1B5E20] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {session.title || 'New Chat'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSessionMutation.mutate(session.sessionId);
                    if (urlSessionId === session.sessionId) {
                      navigate('/chat');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-gray-100 bg-gray-50/60 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/10 focus:border-[#2E7D32]/30 transition-all"
          />
        </div>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto px-3">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 px-2 pt-1 pb-2">
          Knowledge Base
        </span>
        {filteredDocs.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-xs text-gray-300 font-medium">No documents yet</p>
            <p className="text-[11px] text-gray-300 mt-0.5">Upload a file to get started</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {uploadingFiles.map((upFile) => (
              <li key={upFile.id}>
                <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left bg-gray-50/50 cursor-wait">
                  <div className="shrink-0">
                    <Loader2 className="w-4 h-4 text-[#2E7D32] animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate text-gray-400">{upFile.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Uploading to R2...</p>
                  </div>
                </div>
              </li>
            ))}
            {filteredDocs.map((doc) => (
              <DocumentListItem
                key={doc.id}
                doc={doc}
                updateDocumentStatus={updateDocumentStatus}
                onDelete={handleDeleteDocument}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Bottom — User Profile only (no settings) */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-700 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar (always visible) ─── */}
      <aside className="hidden md:flex h-full bg-white border-r border-gray-100 flex-col overflow-hidden shrink-0">
        {sidebarContent}
      </aside>

      {/* ─── Mobile Sidebar (overlay, toggled) ─── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />

            {/* Slide-in sidebar */}
            <motion.aside
              initial={{ x: -272 }}
              animate={{ x: 0 }}
              exit={{ x: -272 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
