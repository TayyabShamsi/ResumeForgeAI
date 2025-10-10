import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BeforeAfterSectionProps {
  title: string;
  before: string;
  after: string;
}

export function BeforeAfterSection({ title, before, after }: BeforeAfterSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 space-y-3">
          <Badge variant="outline" className="border-destructive/40 text-destructive">
            Before
          </Badge>
          <p className="text-sm leading-relaxed">{before}</p>
        </div>
        <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-6 space-y-3 relative">
          <div className="hidden md:flex absolute -left-8 top-1/2 -translate-y-1/2 items-center justify-center w-6 h-6 rounded-full bg-primary">
            <ArrowRight className="h-4 w-4 text-primary-foreground" />
          </div>
          <Badge variant="outline" className="border-chart-3/40 text-chart-3">
            After
          </Badge>
          <p className="text-sm leading-relaxed">{after}</p>
        </div>
      </div>
    </div>
  );
}
