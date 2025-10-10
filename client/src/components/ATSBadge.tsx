import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ATSBadgeProps {
  passed: boolean;
  score?: number;
}

export function ATSBadge({ passed, score }: ATSBadgeProps) {
  return (
    <Badge
      variant={passed ? "outline" : "outline"}
      className={
        passed
          ? "border-chart-3 text-chart-3 gap-1.5"
          : "border-destructive text-destructive gap-1.5"
      }
      data-testid="badge-ats"
    >
      {passed ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      ATS {passed ? "Pass" : "Fail"}
      {score !== undefined && ` (${score}%)`}
    </Badge>
  );
}
