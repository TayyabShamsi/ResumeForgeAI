import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Sparkles, ArrowRight, Link as LinkIcon, CheckCircle, TrendingUp } from "lucide-react";
import linkedinImage from "@assets/generated_images/LinkedIn_profile_optimization_interface_b229e2f5.png";

export default function LinkedInProfile() {
  const [profileUrl, setProfileUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!profileUrl.trim() && !profileText.trim()) {
      toast({
        title: "Input required",
        description: "Please provide either a profile URL or paste your profile content.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/optimize-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUrl: profileUrl.trim() || undefined,
          profileContent: profileText.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to optimize profile");
      }

      setOptimizationData(data);
      setShowResults(true);
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze LinkedIn profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizationTips = optimizationData ? [
    {
      section: "Headline",
      current: optimizationData.headline?.before || "Software Engineer at Tech Company",
      optimized: optimizationData.headline?.after || "Senior Software Engineer | Expert | Building Solutions",
      impact: "3x more profile views",
      tips: optimizationData.headline?.tips || []
    },
    {
      section: "About Section",
      current: optimizationData.about?.before || "I'm a software engineer...",
      optimized: optimizationData.about?.after || "Transforming ideas into scalable applications...",
      impact: "Higher engagement rate",
      tips: optimizationData.about?.tips || []
    },
    {
      section: "Experience Bullet",
      current: optimizationData.experience?.before || "Worked on projects",
      optimized: optimizationData.experience?.after || "Led development of solutions...",
      impact: "More recruiter interest",
      tips: optimizationData.experience?.tips || []
    }
  ] : [
    {
      section: "Headline",
      current: "Software Engineer at Tech Company",
      optimized: "Senior Software Engineer | React & Node.js Expert | Building Scalable Solutions for 10M+ Users",
      impact: "3x more profile views",
      tips: []
    },
    {
      section: "About Section",
      current: "I'm a software engineer with experience in web development...",
      optimized: "Transforming ideas into scalable web applications\n\n5+ years building products that impact millions of users. Specialized in React, Node.js, and cloud architecture. Led development of features that increased user engagement by 45%.\n\nPassionate about clean code, performance optimization, and mentoring junior developers.",
      impact: "Higher engagement rate",
      tips: []
    },
    {
      section: "Experience Bullet",
      current: "Worked on various projects and improved performance",
      optimized: "• Led development of microservices architecture serving 10M+ daily users\n• Reduced API response time by 65% through Redis caching and query optimization\n• Mentored 5 junior developers, improving team velocity by 30%",
      impact: "More recruiter interest",
      tips: []
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative h-72 overflow-hidden border-b">
          <img 
            src={linkedinImage} 
            alt="LinkedIn Profile Optimization" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/90 to-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm font-semibold text-primary backdrop-blur-sm" data-testid="badge-linkedin-optimization">
                <Linkedin className="h-5 w-5" />
                LinkedIn Optimization
              </div>
              <h1 className="text-5xl font-bold" data-testid="heading-linkedin-title">
                Optimize Your LinkedIn Profile
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-linkedin-description">
                AI-powered profile analysis to get more views, connections, and job opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {!showResults ? (
            <>
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-2xl font-semibold">Get Started</h2>
                <p className="text-muted-foreground">
                  Share your LinkedIn profile URL or paste your profile content to receive AI-powered optimization suggestions
                </p>
              </div>

              <Tabs defaultValue="url" className="max-w-3xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Profile URL</TabsTrigger>
                  <TabsTrigger value="text">Paste Content</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <LinkIcon className="h-4 w-4 text-primary" />
                      LinkedIn Profile URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      className="mb-4"
                      data-testid="input-linkedin-url"
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={!profileUrl || isAnalyzing}
                      className="w-full"
                      data-testid="button-analyze-url"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Profile
                        </>
                      )}
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <label className="text-sm font-semibold mb-3 block">
                      Paste Your LinkedIn Profile Content
                    </label>
                    <Textarea
                      placeholder="Paste your LinkedIn headline, about section, and experience here..."
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      rows={10}
                      className="mb-4"
                      data-testid="textarea-linkedin-content"
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={!profileText.trim() || isAnalyzing}
                      className="w-full"
                      data-testid="button-analyze-text"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Profile
                        </>
                      )}
                    </Button>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Optimization Suggestions</h2>
                  <p className="text-muted-foreground">
                    Here's how to make your profile stand out
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowResults(false)} data-testid="button-analyze-another">
                  Analyze Another
                </Button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profile Strength</p>
                      <p className="text-2xl font-bold">72%</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Improvement</p>
                      <p className="text-2xl font-bold">+45%</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <Linkedin className="h-6 w-6 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sections to Optimize</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Optimization Tips */}
              <div className="space-y-6">
                {optimizationTips.map((tip, index) => (
                  <Card key={index} className="p-6 hover-elevate">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold">{tip.section}</h3>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-success/10 text-success">
                        {tip.impact}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs">×</span>
                          Current
                        </p>
                        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                          <p className="text-sm whitespace-pre-line">{tip.current}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-success mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          Optimized
                        </p>
                        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                          <p className="text-sm whitespace-pre-line">{tip.optimized}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* CTA */}
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
                <h3 className="text-2xl font-bold mb-3">Apply These Changes</h3>
                <p className="text-muted-foreground mb-6">
                  Copy the optimized versions and update your LinkedIn profile to increase visibility
                </p>
                <Button size="lg" data-testid="button-copy-suggestions">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Copy All Suggestions
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
