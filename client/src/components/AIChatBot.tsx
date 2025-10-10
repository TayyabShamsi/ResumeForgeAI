import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI resume assistant. I can help you with:\n\n• Resume writing tips\n• ATS optimization advice\n• Interview preparation\n• Career guidance\n\nWhat would you like help with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    //todo: remove mock functionality - replace with actual AI API call
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    //todo: remove mock functionality - replace with actual AI
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("resume") || lowerInput.includes("cv")) {
      return "Here are key tips for a strong resume:\n\n1. **Quantify achievements**: Use numbers and metrics (e.g., 'Increased sales by 40%')\n2. **Use action verbs**: Start bullets with strong verbs like 'Led', 'Developed', 'Optimized'\n3. **Tailor to the job**: Match keywords from the job description\n4. **Keep it concise**: 1 page for <10 years experience, 2 pages max\n5. **ATS-friendly format**: Avoid tables, images, and fancy formatting\n\nWould you like specific advice on any section?";
    }
    
    if (lowerInput.includes("ats") || lowerInput.includes("tracking")) {
      return "To optimize your resume for ATS (Applicant Tracking Systems):\n\n• Use standard section headings (Experience, Education, Skills)\n• Include relevant keywords from the job posting\n• Avoid headers/footers and text boxes\n• Use simple formatting (no tables or columns)\n• Save as .docx or PDF (check job posting preferences)\n• Spell out acronyms at least once\n\nUpload your resume to get a detailed ATS compatibility check!";
    }
    
    if (lowerInput.includes("interview") || lowerInput.includes("question")) {
      return "Interview preparation tips:\n\n**Before the interview:**\n• Research the company thoroughly\n• Prepare STAR method examples\n• Practice common questions aloud\n• Prepare 3-5 questions to ask them\n\n**During the interview:**\n• Listen carefully before answering\n• Be specific with examples\n• Show enthusiasm for the role\n• Ask for clarification if needed\n\nUse our Interview Prep feature to practice with AI-generated questions based on your resume!";
    }
    
    return "I'd be happy to help! I can provide guidance on:\n\n• Resume writing and formatting\n• ATS optimization strategies\n• Interview preparation techniques\n• Career development advice\n\nCould you tell me more about what you'd like to focus on?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-all",
          isOpen && "scale-0"
        )}
        size="icon"
        data-testid="button-chat-toggle"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] h-[600px] flex flex-col shadow-2xl transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-chart-2/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Resume Assistant</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-chat-close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-lg p-3 whitespace-pre-wrap text-sm",
                    message.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about resumes or interviews..."
              className="min-h-[60px] max-h-[120px] resize-none"
              data-testid="textarea-chat-input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
              data-testid="button-chat-send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
