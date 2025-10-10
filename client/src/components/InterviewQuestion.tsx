import { useState } from "react";
import { ChevronDown, Copy, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InterviewQuestionProps {
  question: string;
  category: "Behavioral" | "Technical" | "Situational" | "Curveball";
  reason: string;
  sampleAnswer: string;
  talkingPoints: string[];
}

export function InterviewQuestion({
  question,
  category,
  reason,
  sampleAnswer,
  talkingPoints,
}: InterviewQuestionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  const categoryColors = {
    Behavioral: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    Technical: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    Situational: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Curveball: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Q: ${question}\n\nA: ${sampleAnswer}`);
    toast({
      title: "Copied to clipboard",
      description: "Question and answer copied successfully",
    });
  };

  return (
    <Card className="overflow-hidden hover-elevate">
      <div
        className="p-4 cursor-pointer flex items-center justify-between gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="question-header"
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-xs", categoryColors[category])}>
              {category}
            </Badge>
          </div>
          <p className="font-medium text-base">{question}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Why they ask this:</h4>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Sample Answer:</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAnswer(!showAnswer);
                  }}
                  data-testid="button-toggle-answer"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Answer
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Answer
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showAnswer && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm leading-relaxed">{sampleAnswer}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Key Talking Points:</h4>
            <ul className="space-y-1">
              {talkingPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
