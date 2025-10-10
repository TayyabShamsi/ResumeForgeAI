import { MetricCard } from "../MetricCard";
import { FileText, Target, CheckCircle, TrendingUp } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Sections Analyzed"
        value={8}
        icon={FileText}
        description="All major sections reviewed"
      />
      <MetricCard
        title="Keywords Found"
        value={23}
        icon={Target}
        description="Matching job requirements"
      />
      <MetricCard
        title="ATS Score"
        value="92%"
        icon={CheckCircle}
        description="Excellent compatibility"
      />
      <MetricCard
        title="Improvement"
        value="+34%"
        icon={TrendingUp}
        description="Potential score increase"
      />
    </div>
  );
}
