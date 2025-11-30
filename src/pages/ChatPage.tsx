import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChatBot } from '@/components/ChatBot';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Page } from '@/App';

interface ChatPageProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function ChatPage({ user, onNavigate, onLogout }: ChatPageProps) {
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    messages,
    isLoading,
    isInitializing,
    currentSessionId,
    sessions,
    sendMessage,
    createNewChat,
    switchSession,
    deleteSession,
  } = useChat({ userId: user.id || '' });

  if (!user.id) {
    return (
      <DashboardLayout user={user} currentPage="chat" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please log in to use the chatbot.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNewChat = async () => {
    try {
      await createNewChat();
      toast({
        title: 'Success',
        description: 'New chat created.',
      });
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      toast({
        title: 'Success',
        description: 'Chat deleted.',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat.',
        variant: 'destructive',
      });
    }
  };

  if (isInitializing) {
    return (
      <DashboardLayout user={user} currentPage="chat" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading chat history...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} currentPage="chat" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="h-full flex gap-4">
        {/* Chat Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border border-border rounded-lg bg-card">
          <div className="p-4 border-b">
            <Button
              onClick={handleNewChat}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No chat history yet
                </p>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left',
                      currentSessionId === session.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs opacity-70">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className={cn(
                        'ml-2 p-1 rounded hover:bg-destructive/20',
                        currentSessionId === session.id
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2 mb-4 p-4 border border-border rounded-lg bg-card">
            <Button
              onClick={handleNewChat}
              size="sm"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Sidebar */}
          {isMobileSidebarOpen && (
            <div className="lg:hidden mb-4 p-4 border border-border rounded-lg bg-card">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No chat history yet
                    </p>
                  ) : (
                    sessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => {
                          switchSession(session.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left',
                          currentSessionId === session.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent text-foreground'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs opacity-70">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className={cn(
                            'ml-2 p-1 rounded hover:bg-destructive/20',
                            currentSessionId === session.id
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat Content */}
          {currentSessionId ? (
            <ChatBot
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              title="Clinical Assistant"
              description="Ask questions about your patients and get clinical assistance"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground mb-4">No chat selected</p>
                <Button onClick={handleNewChat}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start a New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
