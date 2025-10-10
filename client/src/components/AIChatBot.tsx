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
      content: "Hi! I'm your **Interview Coach**. I can help you:\n\n• Master the STAR method\n• Handle tough questions (weakness, conflict, failure)\n• Build confidence and reduce nervousness\n• Prepare questions to ask interviewers\n• Navigate salary negotiations\n• Prepare for technical interviews\n\nWhat would you like to practice?",
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
    
    if (lowerInput.includes("star") || lowerInput.includes("method")) {
      return "The **STAR Method** is perfect for behavioral questions:\n\n**S** - Situation: Set the context (2-3 sentences)\n**T** - Task: Explain what needed to be done\n**A** - Action: Describe YOUR specific actions\n**R** - Result: Share the outcome with metrics\n\n**Example:** 'When our app crashed during peak hours (S), I needed to restore service and prevent future issues (T). I quickly identified the database bottleneck, implemented caching, and set up monitoring (A). This reduced downtime by 90% and improved response time by 60% (R).'";
    }
    
    if (lowerInput.includes("nervous") || lowerInput.includes("anxiety") || lowerInput.includes("confident")) {
      return "Nervousness is normal! Here's how to stay confident:\n\n**Before:**\n• Practice answers out loud 5-10 times\n• Research the company deeply\n• Prepare 2-3 stories for common questions\n• Get good sleep the night before\n\n**During:**\n• Take a breath before answering\n• It's okay to pause and think\n• Ask for clarification if needed\n• Remember: they want you to succeed!\n\nPractice with the questions above - familiarity builds confidence!";
    }
    
    if (lowerInput.includes("weakness") || lowerInput.includes("weaknesses")) {
      return "For 'What's your weakness?' questions:\n\n**DO:**\n• Choose a real but manageable weakness\n• Show self-awareness\n• Explain steps you're taking to improve\n• Keep it professional\n\n**Example:** 'I tend to be overly detail-oriented, which sometimes slows me down. I've learned to set time limits for tasks and focus on 'good enough' for low-impact work while maintaining high standards for critical deliverables.'\n\n**DON'T:**\n• Say 'I'm a perfectionist' (cliché)\n• Mention critical job requirements\n• Leave it without showing improvement";
    }
    
    if (lowerInput.includes("behavioral") || lowerInput.includes("situational")) {
      return "For behavioral questions, use real examples:\n\n**Types to prepare:**\n• Leadership & teamwork\n• Conflict resolution\n• Failure & learning\n• Problem-solving\n• Time management\n\n**Pro tip:** Prepare 5-7 strong stories that can answer multiple questions. For example, one project story might demonstrate leadership, problem-solving, AND communication skills.\n\nLook through the questions above and identify which stories from your experience fit best!";
    }
    
    if (lowerInput.includes("technical") || lowerInput.includes("coding")) {
      return "For technical interviews:\n\n**Preparation:**\n• Review job description for key technologies\n• Practice explaining concepts simply\n• Prepare examples of your technical work\n• Be ready to discuss trade-offs\n\n**During the interview:**\n• Think out loud - show your process\n• Ask clarifying questions\n• Discuss different approaches\n• Mention scalability and edge cases\n\n**Example:** Don't just say 'I'd use Redis for caching.' Say 'I'd use Redis for caching because it's fast, supports TTL, and works well with our Node.js stack. For 10M+ users, I'd also consider CDN caching for static content.'";
    }
    
    if (lowerInput.includes("question") && (lowerInput.includes("ask them") || lowerInput.includes("ask interviewer"))) {
      return "Great questions to ask interviewers:\n\n**About the role:**\n• What does success look like in the first 90 days?\n• What are the biggest challenges for this position?\n• How does this role contribute to company goals?\n\n**About the team:**\n• How would you describe the team culture?\n• What's the team's biggest achievement recently?\n• How does the team handle disagreements?\n\n**About growth:**\n• What learning opportunities are available?\n• How do you support career development?\n\n**Avoid:** Salary/benefits (save for HR), questions answered on their website";
    }
    
    if (lowerInput.includes("salary") || lowerInput.includes("negotiate")) {
      return "Salary negotiation tips:\n\n**Research first:**\n• Use Glassdoor, Levels.fyi, Payscale\n• Consider location, experience, company size\n• Know your market value\n\n**During negotiation:**\n• Let them make the first offer\n• Give a range, not a single number\n• Consider total compensation (equity, bonus, benefits)\n• Practice your pitch out loud\n\n**Example:** 'Based on my research and experience, I'm looking for $X-Y range. I'm excited about this opportunity and confident I can deliver significant value to your team.'\n\n**Remember:** Everything is negotiable - salary, equity, vacation, remote work, start date, signing bonus!";
    }
    
    return "I'm your **Interview Coach**! I can help with:\n\n• **STAR method** for behavioral questions\n• **Confidence tips** for managing nervousness\n• **Technical interview** strategies\n• **Questions to ask** interviewers\n• **Salary negotiation** tactics\n• **Common pitfalls** to avoid\n\nWhat specific aspect of interviewing would you like to work on?";
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
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Card className="w-[380px] h-[600px] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-chart-2/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Interview Coach</h3>
                <p className="text-xs text-muted-foreground">Your AI interview partner</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              data-testid="button-chat-close"
              className="relative z-20"
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
              placeholder="Ask me about interview strategies..."
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
      </div>
    </>
  );
}