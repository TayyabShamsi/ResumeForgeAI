import { Flame, Sparkles } from "lucide-react";

interface RoastItemProps {
  text: string;
  type: "criticism" | "strength";
  explanation?: string;
}

export function RoastItem({ text, type, explanation }: RoastItemProps) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-card border border-card-border" data-testid={`roast-item-${type}`}>
      <div className="flex-shrink-0">
        {type === "criticism" ? (
          <Flame className="h-5 w-5 text-destructive" />
        ) : (
          <Sparkles className="h-5 w-5 text-success" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{text}</p>
        {explanation && (
          <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
        )}
      </div>
    </div>
  );
}
