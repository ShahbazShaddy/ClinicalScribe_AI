import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Copy, Share2, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple markdown to HTML converter
function markdownToHtml(text: string): string {
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.*?)$/gm, '<h3 class="font-semibold text-base mt-2 mb-1">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="font-semibold text-lg mt-3 mb-2">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="font-semibold text-xl mt-4 mb-3">$1</h1>')
    // Lists
    .replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4">$2</li>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre class="bg-muted p-3 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph if not already wrapped
    .replace(/<li/g, '<ul><li')
    .replace(/li>/g, 'li></ul>');

  // Fix list wrapping
  html = html.replace(/<\/ul><ul>/g, '');
  
  return `<div class="prose prose-sm max-w-none dark:prose-invert">${html}</div>`;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatBotProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  placeholder?: string;
  title?: string;
  description?: string;
  onRegenerate?: (message: ChatMessage) => Promise<void> | void;
  onFeedback?: (message: ChatMessage, feedback: 'up' | 'down') => Promise<void> | void;
}

export function ChatBot({
  messages,
  isLoading = false,
  onSendMessage,
  placeholder = "Ask me anything about your patients...",
  title = "Clinical Assistant",
  description = "Ask questions and get assistance with patient information and clinical decisions",
  onRegenerate,
  onFeedback,
}: ChatBotProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) {
      return;
    }

    const message = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1500);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleShare = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Clinical Assistant Message',
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
      }
    } catch (error) {
      console.error('Failed to share message:', error);
    }
  };

  const handleRegenerate = async (message: ChatMessage) => {
    if (onRegenerate) {
      await onRegenerate(message);
    } else {
      console.info('Regenerate handler not implemented.', message);
    }
  };

  const handleFeedback = async (message: ChatMessage, feedback: 'up' | 'down') => {
    if (onFeedback) {
      await onFeedback(message, feedback);
    } else {
      console.info('Feedback recorded:', feedback, message);
    }
  };

  return (
    <Card className="h-full w-full flex flex-col bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 w-full overflow-hidden">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-center text-muted-foreground">
                <div>
                  <p className="font-semibold mb-2">Start a conversation</p>
                  <p className="text-sm">Ask questions about your patients, clinical decisions, or get assistance with medical queries.</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const messageId = message.id || `msg-${index}`;
                  const isAssistant = message.role === 'assistant';

                  return (
                    <div
                      key={messageId}
                      className={cn(
                        'flex w-full flex-col',
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-shadow',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted text-muted-foreground rounded-bl-none'
                        )}
                      >
                        {isAssistant ? (
                          <div 
                            className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_em]:italic [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_code]:bg-black/20 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-black/20 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                        {message.timestamp && (
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>

                      <div
                        className={cn(
                          'mt-2 flex items-center gap-2 px-2 py-1 text-muted-foreground',
                          message.role === 'user' ? 'flex-row-reverse justify-end' : 'flex-row justify-start'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleCopy(message.content, messageId)}
                          aria-label="Copy message"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(message.content)}
                          aria-label="Share message"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        {isAssistant && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRegenerate(message)}
                              aria-label="Regenerate response"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </button>
                            <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
                            <button
                              type="button"
                              onClick={() => handleFeedback(message, 'up')}
                              aria-label="Thumbs up"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(message, 'down')}
                              aria-label="Thumbs down"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {copiedMessageId === messageId && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Copied!
                        </div>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-lg rounded-bl-none px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-background flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              disabled={isSending || isLoading}
              className="flex-1"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isSending || isLoading || !inputValue.trim()}
              size="icon"
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
