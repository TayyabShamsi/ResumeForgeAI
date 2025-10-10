import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, FileText, Target, CheckCircle, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScoreCircle } from "@/components/ScoreCircle";
import { MetricCard } from "@/components/MetricCard";
import { ATSBadge } from "@/components/ATSBadge";
import { RoastItem } from "@/components/RoastItem";
import { KeywordCloud } from "@/components/KeywordCloud";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";

//todo: remove mock functionality
const mockData = {
  score: 72,
  atsScore: 88,
  sectionsAnalyzed: 8,
  keywordsFound: 23,
  improvement: "+34%",
  roasts: [
    { type: "criticism" as const, text: "Your bullet points read like a grocery list, not accomplishments", explanation: "Use action verbs and quantify your impact. 'Led team' is weak, 'Led 5-person team to 40% revenue increase' is powerful." },
    { type: "strength" as const, text: "Strong quantifiable achievements in experience section", explanation: "Great use of metrics and specific numbers to demonstrate impact." },
    { type: "criticism" as const, text: "Generic skills section that could belong to anyone", explanation: "Instead of listing 'Communication', demonstrate it: 'Presented quarterly results to C-suite executives'." },
    { type: "strength" as const, text: "Clear, concise professional summary", explanation: "Your opening paragraph immediately communicates your value proposition." },
    { type: "criticism" as const, text: "Missing keywords crucial for this role", explanation: "The job posting mentions 'Agile' 12 times, but you don't mention it once. ATS will likely filter you out." },
  ],
  missingKeywords: ["Agile", "Scrum", "Stakeholder Management", "Data-Driven", "Cross-functional", "OKRs", "Product Strategy"],
  beforeAfter: [
    {
      title: "Professional Summary",
      before: "Experienced software developer with skills in various programming languages and technologies. Good team player who works well with others.",
      after: "Results-driven Software Engineer with 5+ years of experience architecting scalable web applications. Expertise in React, Node.js, and AWS. Led development of features that increased user engagement by 45% and reduced load times by 60%."
    },
    {
      title: "Work Experience Bullet Point",
      before: "Worked on improving the application performance",
      after: "Optimized application performance by implementing Redis caching and lazy loading, reducing API response time by 65% and improving Core Web Vitals scores from 45 to 92"
    }
  ]
};

export default function Results() {
  const [, setLocation] = useLocation();
  const [showPreview] = useState(false);

  const handleGenerateQuestions = () => {
    console.log("Generating interview questions");
    setLocation("/interview-prep");
  };

  const handleDownloadReport = () => {
    console.log("Downloading PDF report");
    //todo: remove mock functionality - implement PDF generation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-border bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2"
              data-testid="button-home"
            >
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                ResumeForge AI
              </span>
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadReport} data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Results Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Your Resume Analysis</h1>
          <p className="text-lg text-muted-foreground">Here's your brutally honest feedback</p>
        </div>

        {/* Score Dashboard */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="flex justify-center">
            <ScoreCircle score={mockData.score} />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Sections Analyzed"
              value={mockData.sectionsAnalyzed}
              icon={FileText}
              description="All major sections reviewed"
            />
            <MetricCard
              title="Keywords Found"
              value={mockData.keywordsFound}
              icon={Target}
              description="Matching job requirements"
            />
            <MetricCard
              title="ATS Score"
              value={`${mockData.atsScore}%`}
              icon={CheckCircle}
              description="Excellent compatibility"
            />
            <MetricCard
              title="Improvement"
              value={mockData.improvement}
              icon={TrendingUp}
              description="Potential score increase"
            />
          </div>
        </div>

        {/* ATS Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">ATS Compatibility</h3>
              <p className="text-sm text-muted-foreground">
                Your resume will likely pass Applicant Tracking Systems
              </p>
            </div>
            <ATSBadge passed={mockData.atsScore >= 70} score={mockData.atsScore} />
          </div>
        </Card>

        {/* Roast Points */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">The Roast</h2>
          <div className="space-y-3">
            {mockData.roasts.map((roast, index) => (
              <RoastItem
                key={index}
                type={roast.type}
                text={roast.text}
                explanation={roast.explanation}
              />
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Missing Keywords</h2>
            <p className="text-muted-foreground">Add these keywords to improve ATS compatibility</p>
          </div>
          <KeywordCloud keywords={mockData.missingKeywords} />
        </div>

        {/* Before/After Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Suggested Improvements</h2>
          {mockData.beforeAfter.map((section, index) => (
            <BeforeAfterSection
              key={index}
              title={section.title}
              before={section.before}
              after={section.after}
            />
          ))}
        </div>

        {/* Resume Preview (Optional) */}
        {showPreview && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
            <div className="bg-muted rounded-lg p-6 max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                {/* Resume text would go here */}
                Resume text preview...
              </p>
            </div>
          </Card>
        )}

        {/* Generate Interview Questions CTA */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 via-background to-chart-2/10 border-primary/20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready for the Interview?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get 25 personalized interview questions based on your resume and job description, complete with sample answers and talking points.
            </p>
            <Button
              onClick={handleGenerateQuestions}
              size="lg"
              className="shadow-lg shadow-primary/25"
              data-testid="button-generate-questions"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Interview Questions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
