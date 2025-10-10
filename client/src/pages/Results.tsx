import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, FileText, Target, CheckCircle, TrendingUp, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreCircle } from "@/components/ScoreCircle";
import { MetricCard } from "@/components/MetricCard";
import { ATSBadge } from "@/components/ATSBadge";
import { RoastItem } from "@/components/RoastItem";
import { KeywordCloud } from "@/components/KeywordCloud";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import analyticsImage from "@assets/stock_images/data_analytics_dashb_7db4b466.jpg";

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
  const [activeTab, setActiveTab] = useState("overview");

  const handleGenerateQuestions = () => {
    console.log("Generating interview questions");
    setLocation("/interview-prep");
  };

  const handleDownloadReport = () => {
    console.log("Downloading PDF report");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header with Background */}
        <div className="relative bg-gradient-to-br from-muted/50 to-primary/5 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Resume Analysis</h1>
                <p className="text-muted-foreground">Here's your brutally honest feedback</p>
              </div>
              <Button variant="outline" onClick={handleDownloadReport} data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Score Dashboard */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="flex justify-center">
              <ScoreCircle score={mockData.score} />
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { title: "Sections Analyzed", value: mockData.sectionsAnalyzed, icon: FileText, description: "All major sections reviewed" },
                { title: "Keywords Found", value: mockData.keywordsFound, icon: Target, description: "Matching job requirements" },
                { title: "ATS Score", value: `${mockData.atsScore}%`, icon: CheckCircle, description: "Excellent compatibility" },
                { title: "Improvement", value: mockData.improvement, icon: TrendingUp, description: "Potential score increase" }
              ].map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="roast" data-testid="tab-roast">Feedback</TabsTrigger>
              <TabsTrigger value="keywords" data-testid="tab-keywords">Keywords</TabsTrigger>
              <TabsTrigger value="improvements" data-testid="tab-improvements">Improve</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6 hover-elevate">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">ATS Compatibility</h3>
                    <p className="text-muted-foreground">
                      Your resume will likely pass Applicant Tracking Systems
                    </p>
                  </div>
                  <ATSBadge passed={mockData.atsScore >= 70} score={mockData.atsScore} />
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4 hover-elevate">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {mockData.roasts.filter(r => r.type === 'strength').map((roast, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-success mt-0.5">✓</span>
                        <span className="text-sm">{roast.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 space-y-4 hover-elevate">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-destructive" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {mockData.roasts.filter(r => r.type === 'criticism').map((roast, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span className="text-sm">{roast.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roast" className="space-y-4">
              {mockData.roasts.map((roast, index) => (
                <RoastItem
                  key={index}
                  type={roast.type}
                  text={roast.text}
                  explanation={roast.explanation}
                />
              ))}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Missing Keywords</h3>
                <p className="text-muted-foreground mb-6">
                  Add these keywords to improve ATS compatibility and match job requirements
                </p>
                <KeywordCloud keywords={mockData.missingKeywords} />
              </Card>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-6">
              {mockData.beforeAfter.map((section, index) => (
                <BeforeAfterSection
                  key={index}
                  title={section.title}
                  before={section.before}
                  after={section.after}
                />
              ))}
            </TabsContent>
          </Tabs>

          {/* CTA Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img src={analyticsImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready for the Interview?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
