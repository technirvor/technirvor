'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageCircle, Clock } from 'lucide-react';
import { Conversation } from '@/lib/types/user';
import {
  getUserConversations,
  searchUsers,
  startConversation
} from '@/lib/services/messaging-service';

interface ConversationListProps {
  sessionToken: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  className?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  sessionToken,
  onSelectConversation,
  selectedConversationId,
  className = ''
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
      setShowNewChat(false);
    }
  }, [searchQuery]);

  const loadConversations = async (pageNum: number = 1, reset: boolean = true) => {
    try {
      setLoading(true);
      const response = await getUserConversations(sessionToken, pageNum, 20);
      
      if (response.success && response.data) {
        if (reset) {
          setConversations(response.data);
        } else {
          setConversations(prev => [...prev, ...response.data!]);
        }
        setHasMore(response.data.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await searchUsers(sessionToken, searchQuery, 10);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
        setShowNewChat(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const response = await startConversation(sessionToken, userId);
      
      if (response.success && response.data) {
        // Refresh conversations to include the new one
        await loadConversations();
        setSearchQuery('');
        setShowNewChat(false);
        
        // Select the new conversation if available
        if (response.data.conversation) {
          onSelectConversation(response.data.conversation);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  const loadMoreConversations = () => {
    if (!loading && hasMore) {
      loadConversations(page + 1, false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations or users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Results */}
      {showNewChat && (
        <div className="border-b bg-gray-50">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Start new conversation</h3>
            {searchLoading ? (
              <div className="text-center py-4 text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user.id)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
              <div className="text-center py-4 text-gray-500">Type to search users</div>
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm">Start a new conversation by searching for users</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const otherParticipant = conversation.other_participant || {
                id: conversation.participant_1 === conversation.participant_2 
                  ? conversation.participant_1 
                  : conversation.participant_2,
                full_name: 'Unknown User',
                email: ''
              };
              
              const isSelected = selectedConversationId === conversation.id;
              const hasUnread = (conversation.unread_count || 0) > 0;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {otherParticipant.full_name.charAt(0).toUpperCase()}
                    </div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium truncate ${
                        hasUnread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {otherParticipant.full_name}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    </div>
                    
                    {conversation.last_message && (
                      <p className={`text-sm truncate ${
                        hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {truncateMessage(conversation.last_message.message)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="p-4">
                <button
                  onClick={loadMoreConversations}
                  disabled={loading}
                  className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more conversations'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;