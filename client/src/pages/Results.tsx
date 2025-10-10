import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, FileText, Target, CheckCircle, TrendingUp, Download, ArrowRight, FileEdit, Copy, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScoreCircle } from "@/components/ScoreCircle";
import { MetricCard } from "@/components/MetricCard";
import { ATSBadge } from "@/components/ATSBadge";
import { RoastItem } from "@/components/RoastItem";
import { KeywordCloud } from "@/components/KeywordCloud";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { PaywallModal } from "@/components/PaywallModal";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import atsImage from "@assets/generated_images/ATS_compatibility_analysis_visualization_d3c39158.png";
import keywordImage from "@assets/generated_images/Keyword_analysis_visualization_23ebf236.png";
import improvementImage from "@assets/generated_images/Resume_improvement_visualization_3f91e291.png";
import interviewImage from "@assets/generated_images/AI_interview_preparation_visualization_64de33b7.png";

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

interface RewriteData {
  revisedResume: string;
  keyChanges: string[];
  wordCount: {
    original: number;
    revised: number;
  };
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisData, setAnalysisData] = useState<typeof mockData>(mockData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteData, setRewriteData] = useState<RewriteData | null>(null);
  const [editedResume, setEditedResume] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();

  // Fetch subscription info for paywall modal
  const { data: subscriptionInfo } = useQuery<{
    tier: string;
    credits: { resume: number; interview: number; linkedin: number; coverLetter: number };
  }>({
    queryKey: ["/api/subscription-info"],
    enabled: showPaywall,
  });

  useEffect(() => {
    const storedData = sessionStorage.getItem("resumeAnalysis");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setAnalysisData(data);
      } catch (e) {
        console.error("Failed to parse stored analysis data", e);
      }
    }
  }, []);

  const handleGenerateQuestions = async () => {
    const resumeText = sessionStorage.getItem("resumeText") || "";
    const jobDescription = sessionStorage.getItem("jobDescription") || "";

    if (!resumeText || !jobDescription) {
      setLocation("/interview-prep");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if error is due to credit limit
        if (data.error?.includes("credit") || data.error?.includes("limit") || response.status === 403) {
          setIsGenerating(false);
          setShowPaywall(true);
          return;
        }
        throw new Error(data.error || "Failed to generate questions");
      }

      sessionStorage.setItem("interviewQuestions", JSON.stringify(data));
      setLocation("/interview-prep");
    } catch (error: any) {
      console.error("Failed to generate questions:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = margin;

    // Helper to add text with auto page break
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      
      const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
      yPos += 3;
    };

    const addSection = (title: string) => {
      yPos += 5;
      if (yPos > 260) {
        doc.addPage();
        yPos = margin;
      }
      addText(title, 14, true);
      yPos += 2;
    };

    // Title
    addText("RESUME ANALYSIS REPORT", 18, true);
    addText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    yPos += 5;

    // Overall Score Section
    addSection("Overall Assessment");
    addText(`Resume Score: ${analysisData.score}/100`);
    addText(`ATS Compatibility: ${analysisData.atsScore}%`);
    addText(`Sections Analyzed: ${analysisData.sectionsAnalyzed}`);
    addText(`Keywords Found: ${analysisData.keywordsFound}`);
    addText(`Potential Improvement: ${analysisData.improvement}`);

    // Strengths
    addSection("Key Strengths");
    const strengths = analysisData.roasts.filter(r => r.type === 'strength');
    strengths.forEach((strength, idx) => {
      addText(`${idx + 1}. ${strength.text}`);
      if (strength.explanation) {
        addText(`   ${strength.explanation}`, 9);
      }
    });

    // Areas to Improve
    addSection("Areas to Improve");
    const criticisms = analysisData.roasts.filter(r => r.type === 'criticism');
    criticisms.forEach((criticism, idx) => {
      addText(`${idx + 1}. ${criticism.text}`);
      if (criticism.explanation) {
        addText(`   ${criticism.explanation}`, 9);
      }
    });

    // Missing Keywords
    if (analysisData.missingKeywords?.length > 0) {
      addSection("Missing Keywords for ATS Optimization");
      addText(analysisData.missingKeywords.join(", "));
    }

    // Before/After Examples
    if (analysisData.beforeAfter?.length > 0) {
      addSection("Improvement Examples");
      analysisData.beforeAfter.forEach((example, idx) => {
        addText(`${idx + 1}. ${example.title}`, 12, true);
        addText(`Before: ${example.before}`, 9);
        addText(`After: ${example.after}`, 9);
        yPos += 3;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const footerText = "Generated by ResumeForge AI - AI-Powered Career Tools";
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, 285);

    doc.save("resume-analysis-report.pdf");

    toast({
      title: "Report Downloaded!",
      description: "Your analysis report has been saved as PDF.",
    });
  };

  const handleGenerateRewrite = async () => {
    const resumeText = sessionStorage.getItem("resumeText") || "";
    const jobDescription = sessionStorage.getItem("jobDescription") || "";

    if (!resumeText) {
      toast({
        title: "Error",
        description: "Resume text not found. Please upload a resume again.",
        variant: "destructive",
      });
      return;
    }

    setIsRewriting(true);

    try {
      const response = await fetch("/api/resume/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeText, 
          jobDescription,
          analysisResults: analysisData 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRewriteData(data);
        setEditedResume(data.revisedResume);
        toast({
          title: "Resume Rewritten!",
          description: "Your complete revised resume is ready below.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to rewrite resume.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to rewrite resume:", error);
      toast({
        title: "Error",
        description: "Couldn't generate revision right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopyResume = async () => {
    try {
      await navigator.clipboard.writeText(editedResume);
      toast({
        title: "Copied!",
        description: "Revised resume copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    const lines = doc.splitTextToSize(editedResume, maxLineWidth);
    
    doc.setFontSize(10);
    doc.text(lines, margin, margin);
    doc.save("revised-resume.pdf");

    toast({
      title: "Downloaded!",
      description: "Your resume has been downloaded as PDF.",
    });
  };

  const handleStartOver = () => {
    setRewriteData(null);
    setEditedResume("");
    setLocation("/");
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
              <ScoreCircle score={analysisData.score} />
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                { title: "Sections Analyzed", value: analysisData.sectionsAnalyzed, icon: FileText, description: "All major sections reviewed" },
                { title: "Keywords Found", value: analysisData.keywordsFound, icon: Target, description: "Matching job requirements" },
                { title: "ATS Score", value: `${analysisData.atsScore}%`, icon: CheckCircle, description: "Excellent compatibility" },
                { title: "Improvement", value: analysisData.improvement, icon: TrendingUp, description: "Potential score increase" }
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
              {/* ATS Section with Image */}
              <Card className="relative overflow-hidden hover-elevate">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20">
                  <img src={atsImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">ATS Compatibility</h3>
                      <p className="text-muted-foreground">
                        Your resume will likely pass Applicant Tracking Systems
                      </p>
                    </div>
                    <ATSBadge passed={analysisData.atsScore >= 70} score={analysisData.atsScore} />
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4 hover-elevate">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {analysisData.roasts.filter(r => r.type === 'strength').map((roast, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
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
                    {analysisData.roasts.filter(r => r.type === 'criticism').map((roast, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs mt-0.5 flex-shrink-0">×</span>
                        <span className="text-sm">{roast.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roast" className="space-y-4">
              {analysisData.roasts.map((roast, index) => (
                <RoastItem
                  key={index}
                  type={roast.type}
                  text={roast.text}
                  explanation={roast.explanation}
                />
              ))}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              {/* Keywords Section with Image */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <img src={keywordImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative p-6">
                  <h3 className="text-xl font-semibold mb-3">Missing Keywords</h3>
                  <p className="text-muted-foreground mb-6">
                    Add these keywords to improve ATS compatibility and match job requirements
                  </p>
                  <KeywordCloud keywords={analysisData.missingKeywords} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-6">
              {/* Improvements Header with Image */}
              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 opacity-20">
                  <img src={improvementImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">Suggested Improvements</h3>
                  <p className="text-muted-foreground">
                    See how to transform weak statements into powerful achievements
                  </p>
                </div>
              </Card>

              {analysisData.beforeAfter.map((section, index) => (
                <BeforeAfterSection
                  key={index}
                  title={section.title}
                  before={section.before}
                  after={section.after}
                />
              ))}
            </TabsContent>
          </Tabs>

          {/* Resume Rewrite Section */}
          {!rewriteData ? (
            <Card className="relative overflow-hidden border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
              <div className="relative p-8 sm:p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <FileEdit className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-3">Generate Complete Revised Resume</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Get a fully rewritten, ATS-optimized resume based on the feedback above. 
                    Our AI will restructure and enhance your entire resume while keeping all your real achievements.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is included in your analysis credit - no extra charge
                  </p>
                </div>
                <Button
                  onClick={handleGenerateRewrite}
                  size="lg"
                  className="shadow-lg shadow-primary/25"
                  data-testid="button-generate-rewrite"
                  disabled={isRewriting}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isRewriting ? "AI is rewriting your resume... this may take 30 seconds" : "Generate Complete Revised Resume"}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Comparison View */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Original Resume */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Your Original Resume</h3>
                    <span className="text-sm text-muted-foreground">
                      {rewriteData.wordCount.original} words
                    </span>
                  </div>
                  <Textarea
                    value={sessionStorage.getItem("resumeText") || ""}
                    readOnly
                    className="min-h-[500px] font-mono text-sm bg-muted/50 text-muted-foreground resize-none"
                    data-testid="textarea-original-resume"
                  />
                </Card>

                {/* Revised Resume */}
                <Card className="p-6 space-y-4 border-primary/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-primary">AI-Revised Resume</h3>
                    <span className="text-sm text-primary">
                      {rewriteData.wordCount.revised} words
                      {rewriteData.wordCount.revised < rewriteData.wordCount.original && 
                        " (more concise!)"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This version is optimized for ATS and impact. You can edit it below.
                  </p>
                  <Textarea
                    value={editedResume}
                    onChange={(e) => setEditedResume(e.target.value)}
                    className="min-h-[500px] font-mono text-sm resize-none"
                    data-testid="textarea-revised-resume"
                  />
                </Card>
              </div>

              {/* Key Changes */}
              <Card className="p-6 space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Key Changes Made
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {rewriteData.keyChanges.map((change, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{change}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={handleCopyResume}
                  size="lg"
                  variant="outline"
                  data-testid="button-copy-resume"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Revised Resume
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  size="lg"
                  variant="outline"
                  data-testid="button-download-pdf"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download as PDF
                </Button>
                <Button
                  onClick={handleStartOver}
                  size="lg"
                  variant="outline"
                  data-testid="button-start-over"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* CTA Card with Interview Prep Image */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-15">
              <img src={interviewImage} alt="" className="w-full h-full object-cover" />
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
                disabled={isGenerating}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {isGenerating ? "Generating..." : "Generate Interview Questions"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Paywall Modal */}
      {subscriptionInfo && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName="Interview Questions"
          currentTier={subscriptionInfo.tier}
          creditsRemaining={subscriptionInfo.credits.interview}
        />
      )}
    </PageTransition>
  );
}
