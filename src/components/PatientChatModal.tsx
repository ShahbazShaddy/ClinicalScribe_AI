import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Bot, Trash2, Plus, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientChat } from '@/hooks/usePatientChat';
import type { Patient, User as AppUser } from '@/App';

// Simple markdown to HTML converter
function markdownToHtml(text: string): string {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/^### (.*?)$/gm, '<h3 class="font-semibold text-base mt-2 mb-1">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="font-semibold text-lg mt-3 mb-2">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="font-semibold text-xl mt-4 mb-3">$1</h1>')
    .replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4">$2</li>')
    .replace(/```(.*?)```/gs, '<pre class="bg-muted p-3 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/<li/g, '<ul><li')
    .replace(/li>/g, 'li></ul>');

  html = html.replace(/<\/ul><ul>/g, '');
  
  return `<div class="prose prose-sm max-w-none dark:prose-invert">${html}</div>`;
}

interface PatientChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  user: AppUser;
}

export function PatientChatModal({ isOpen, onClose, patient, user }: PatientChatModalProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isInitializing,
    sendMessage,
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    clearChat,
  } = usePatientChat({
    userId: user.id || '',
    patient,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const suggestedQuestions = [
    `What are ${patient.name}'s current medications?`,
    `Summarize the recent visit history`,
    `What allergies should I be aware of?`,
    `Are there any drug interactions to consider?`,
    `What follow-up care is recommended?`,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">{patient.name} - AI Assistant</DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  {patient.age && (
                    <Badge variant="secondary" className="text-xs">{patient.age} yrs</Badge>
                  )}
                  {patient.gender && (
                    <Badge variant="outline" className="text-xs">
                      {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                    </Badge>
                  )}
                  {patient.diagnoses && patient.diagnoses.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {patient.diagnoses.length} diagnos{patient.diagnoses.length === 1 ? 'is' : 'es'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewSession}
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Session Sidebar - Hidden on mobile */}
          {sessions.length > 1 && (
            <div className="hidden sm:block w-48 border-r bg-muted/30 overflow-y-auto">
              <div className="p-2 space-y-1">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Chat History
                </div>
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-sm truncate transition-colors",
                      session.id === currentSessionId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <MessageSquare className="h-3 w-3 inline-block mr-1.5" />
                    {session.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isInitializing ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading patient information...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 px-4">
                  <div className="py-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          AI Assistant for {patient.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                          Ask me anything about this patient. I have access to their personal information, 
                          medical history, diagnoses, medications, allergies, and visit records.
                        </p>
                        
                        {/* Suggested Questions */}
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Suggested questions:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {suggestedQuestions.slice(0, 3).map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-auto py-1.5 px-3"
                                onClick={() => {
                                  setInputValue(question);
                                }}
                              >
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-3",
                            message.role === 'user' ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 max-w-[80%]",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {message.role === 'assistant' ? (
                              <div
                                className="text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: markdownToHtml(message.content),
                                }}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4 flex-shrink-0">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Ask about ${patient.name}...`}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI responses are for informational purposes. Always verify with clinical judgment.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
