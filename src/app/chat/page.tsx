'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Menu, X, Loader2 } from 'lucide-react';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listing?: {
    _id: string;
    title: string;
    images: string[];
  };
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading chat...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTo = searchParams.get('to');
  const initialListingId = searchParams.get('listingId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(!initialTo);
  const [sendError, setSendError] = useState('');
  const [pendingNewUser, setPendingNewUser] = useState<{ id: string; name: string } | null>(null);
  const [listingFilter, setListingFilter] = useState<string | null>(initialListingId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleConversations = listingFilter
    ? conversations.filter((c) => c.listing?._id === listingFilter)
    : conversations;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/chat' + (initialTo ? `?to=${initialTo}` : ''));
      return;
    }
    fetchConversations();
  }, [isAuthenticated, authLoading, router, initialTo]);

  useEffect(() => {
    if (!isAuthenticated || !initialTo || loading) return;
    if (initialTo === user?.id) return;

    const existing = conversations.find((c) => c.userId === initialTo);
    if (existing) {
      setSelectedUserId(initialTo);
      setShowMobileList(false);
      return;
    }

    if (!initialListingId) return;
    let cancelled = false;
    fetch(`/api/listings/${initialListingId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.listing?.seller?.name) {
          setPendingNewUser({ id: initialTo, name: data.listing.seller.name });
          setSelectedUserId(initialTo);
          setShowMobileList(false);
          if (data.listing.title) {
            setNewMessage((prev) => prev || `Salam! I'm interested in your "${data.listing.title}".`);
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialTo, initialListingId, conversations, isAuthenticated, loading, user]);

  useEffect(() => {
    if (selectedUserId && !pendingNewUser) {
      fetchMessages(selectedUserId);
    } else if (selectedUserId && pendingNewUser?.id === selectedUserId) {
      // Pending new conversation — still try to load any past messages
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, pendingNewUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        const convs: Conversation[] = data.conversations || [];
        setConversations(convs);
        const filtered = listingFilter
          ? convs.filter((c) => c.listing?._id === listingFilter)
          : convs;
        if (filtered.length > 0 && !selectedUserId) {
          setSelectedUserId(filtered[0].userId);
          if (filtered.length === 1) setShowMobileList(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    setSending(true);
    setSendError('');
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver: selectedUserId,
          message: newMessage,
          listing: initialListingId || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessages((prev) => [...prev, data.chat]);
        setNewMessage('');
        setPendingNewUser(null);
        await fetchConversations();
      } else {
        setSendError(data.error || `Failed to send (${response.status})`);
      }
    } catch (error: any) {
      setSendError(error?.message || 'Network error — please try again');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);
  // Show chat panel either when there's an existing conversation OR a pending new one
  const activeRecipient = selectedConversation
    ? { name: selectedConversation.userName }
    : pendingNewUser && pendingNewUser.id === selectedUserId
      ? { name: pendingNewUser.name }
      : null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">💬 Messages</h1>
          <button
            onClick={() => setShowMobileList(!showMobileList)}
            className="md:hidden text-white"
          >
            {showMobileList ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden container mx-auto">
        {/* Conversations List */}
        <aside
          className={`w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto ${
            showMobileList ? 'block' : 'hidden md:block'
          }`}
        >
          {listingFilter && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-sm">
              <span className="text-amber-900 font-semibold">Filtered by listing</span>
              <button
                onClick={() => {
                  setListingFilter(null);
                  setSelectedUserId(null);
                }}
                className="text-amber-700 hover:text-amber-900 font-semibold"
              >
                ← All conversations
              </button>
            </div>
          )}
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading conversations...</div>
          ) : visibleConversations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {visibleConversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  onClick={() => {
                    setSelectedUserId(conversation.userId);
                    setShowMobileList(false);
                  }}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedUserId === conversation.userId ? 'bg-blue-50 border-l-4 border-[#800020]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#800020] to-[#d4a853] flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {conversation.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800 truncate">{conversation.userName}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-600">
              <p>{listingFilter ? 'No messages on this listing yet' : 'No conversations yet'}</p>
              <p className="text-sm mt-2">
                {listingFilter ? 'Buyers can reach you here when they message about this ad' : 'Start chatting by viewing a listing'}
              </p>
            </div>
          )}
        </aside>

        {/* Chat Window */}
        {activeRecipient ? (
          <main className={`flex-1 flex flex-col bg-white ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800020] to-[#d4a853] flex items-center justify-center text-white font-bold text-sm">
                  {activeRecipient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activeRecipient.name}</p>
                  <p className="text-xs text-gray-500">
                    {pendingNewUser ? 'New conversation' : 'Online'}
                  </p>
                </div>
              </div>

              {/* Listing Info */}
              {selectedConversation?.listing && (
                <div className="mt-3 p-2 bg-white rounded border border-gray-200 flex gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedConversation.listing.images[0]}
                    alt={selectedConversation.listing.title}
                    className="w-8 h-8 rounded object-cover bg-gray-200"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {selectedConversation.listing.title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <p>Start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender._id === user?.id
                          ? 'bg-[#800020] text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender._id === user?.id ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {sendError && (
              <div className="bg-rose-50 border-t border-rose-200 text-rose-700 px-4 py-2 text-sm flex items-center justify-between">
                <span>⚠️ {sendError}</span>
                <button onClick={() => setSendError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-gradient-to-r from-[#800020] to-[#e11d48] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 min-w-[56px] justify-center"
                  aria-label={sending ? 'Sending' : 'Send'}
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center bg-white hidden md:flex">
            <p className="text-gray-600">Select a conversation to start messaging</p>
          </main>
        )}
      </div>
    </div>
  );
}
