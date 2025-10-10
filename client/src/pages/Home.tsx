import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, FileText, Zap, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/PageTransition";
import heroImage from "@assets/stock_images/professional_person__1f6a5b7f.jpg";

export default function Home() {
  const [, setLocation] = useLocation();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleRoast = () => {
    if (!resumeFile) return;
    
    console.log("Roasting resume:", resumeFile.name);
    console.log("Job description:", jobDescription);
    
    //todo: remove mock functionality - simulate loading with progress
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingMessage("Parsing resume...");
    
    const messages = [
      "Parsing resume...",
      "Analyzing structure...",
      "Checking ATS compatibility...",
      "Identifying keywords...",
      "Generating feedback...",
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingProgress((step / messages.length) * 100);
      if (step < messages.length) {
        setLoadingMessage(messages[step]);
      }
      if (step >= messages.length) {
        clearInterval(interval);
        setTimeout(() => setLocation("/results"), 300);
      }
    }, 400);
  };

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Get brutally honest feedback powered by Google Gemini AI"
    },
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Ensure your resume passes applicant tracking systems"
    },
    {
      icon: CheckCircle2,
      title: "Interview Prep",
      description: "Get personalized questions with sample answers"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">

      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {/* Hero Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional workspace" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/40 backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="text-center space-y-6 mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Powered by Google Gemini AI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Get Your Resume{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                Roasted
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered brutally honest feedback, ATS compatibility checks, and personalized interview prep
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Card className="p-1 bg-card/50 backdrop-blur-sm border-primary/20">
              <UploadZone
                onFileSelect={setResumeFile}
                isLoading={isLoading}
              />
            </Card>

            {resumeFile && !isLoading && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <Card className="p-4 hover-elevate">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                      data-testid="button-remove-file"
                      className="flex-shrink-0"
                    >
                      Remove
                    </Button>
                  </div>
                </Card>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Job Description <span className="text-muted-foreground">(Optional but recommended)</span>
                  </label>
                  <Textarea
                    placeholder="Paste the job description here to get targeted feedback and keyword analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                    data-testid="textarea-job-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding a job description helps us provide targeted keyword suggestions
                  </p>
                </div>

                <Button
                  onClick={handleRoast}
                  disabled={isLoading}
                  className="w-full h-12 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  data-testid="button-roast"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Roast My Resume
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {isLoading && (
              <Card className="p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium">{loadingMessage}</p>
                    <p className="text-sm text-muted-foreground">Please wait while we analyze your resume</p>
                  </div>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">How ResumeForge AI Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three powerful features to help you land your next job
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 space-y-4 hover-elevate transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 ResumeForge AI. Powered by Google Gemini AI.</p>
        </div>
      </footer>
      </div>
    </PageTransition>
  );
}
