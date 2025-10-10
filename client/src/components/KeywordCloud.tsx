import { Badge } from "@/components/ui/badge";

interface KeywordCloudProps {
  keywords: string[];
}

export function KeywordCloud({ keywords }: KeywordCloudProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="keyword-cloud">
      {keywords.map((keyword, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-sm"
          data-testid={`keyword-${index}`}
        >
          {keyword}
        </Badge>
      ))}
    </div>
  );
}
