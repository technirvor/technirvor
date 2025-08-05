'use client';

import React, { useState, useEffect } from 'react';
import { Conversation } from '@/lib/types/user';
import ConversationList from './ConversationList';
import ChatInterface from './ChatInterface';
import { MessageCircle, Users } from 'lucide-react';

interface MessagingDashboardProps {
  sessionToken: string;
  className?: string;
}

const MessagingDashboard: React.FC<MessagingDashboardProps> = ({
  sessionToken,
  className = ''
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setShowConversationList(true);
      setSelectedConversation(null);
    }
  };

  return (
    <div className={`flex h-full bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Conversation List */}
      <div className={`${
        isMobile 
          ? (showConversationList ? 'w-full' : 'hidden')
          : 'w-1/3 min-w-[300px] max-w-[400px]'
      } border-r border-gray-200`}>
        <ConversationList
          sessionToken={sessionToken}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Chat Interface */}
      <div className={`${
        isMobile 
          ? (showConversationList ? 'hidden' : 'w-full')
          : 'flex-1'
      }`}>
        {selectedConversation ? (
          <ChatInterface
            sessionToken={sessionToken}
            conversation={selectedConversation}
            onBack={isMobile ? handleBackToConversations : undefined}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Select a conversation from the sidebar to start chatting, or create a new conversation.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Connect with users</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Real-time messaging</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingDashboard;