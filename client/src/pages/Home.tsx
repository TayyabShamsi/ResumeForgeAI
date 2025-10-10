import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, FileText, Zap, Target, CheckCircle2, ArrowRight, Upload } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/generated_images/AI_resume_analysis_visualization_1daaff06.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showPasteOption, setShowPasteOption] = useState(false);
  const { toast } = useToast();

  const MAX_RESUME_LENGTH = 10000;

  const handleRoast = async () => {
    if (!resumeFile && !resumeText.trim()) return;
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to analyze your resume against.",
        variant: "destructive",
      });
      return;
    }
    
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
      setLoadingProgress(Math.min((step / messages.length) * 90, 90));
      if (step < messages.length) {
        setLoadingMessage(messages[step]);
      }
    }, 800);

    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append("resume", resumeFile);
      } else {
        formData.append("resumeText", resumeText);
      }
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      clearInterval(interval);
      setLoadingProgress(100);
      setLoadingMessage("Analysis complete!");
      
      // Store results in sessionStorage for the Results page
      const { resumeText: extractedText, ...analysisData } = data;
      sessionStorage.setItem("resumeAnalysis", JSON.stringify(analysisData));
      // Store the actual extracted resume text (not the filename)
      sessionStorage.setItem("resumeText", extractedText || resumeText || "");
      sessionStorage.setItem("jobDescription", jobDescription);
      
      setTimeout(() => setLocation("/results"), 300);
    } catch (error: any) {
      clearInterval(interval);
      setIsLoading(false);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    }
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="AI Resume Analysis" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">AI-Powered Career Tools</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  Get Your Resume{" "}
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    Roasted
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  AI-powered brutally honest feedback, ATS compatibility checks, and personalized interview prep
                </p>
              </div>

              {/* Upload Section */}
              <div className="space-y-6">
                {!isLoading && (
                  <div className="flex gap-3 justify-center mb-6">
                    <Button
                      variant={!showPasteOption ? "default" : "outline"}
                      onClick={() => {
                        setShowPasteOption(false);
                        setResumeText("");
                      }}
                      data-testid="button-upload-option"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      variant={showPasteOption ? "default" : "outline"}
                      onClick={() => {
                        setShowPasteOption(true);
                        setResumeFile(null);
                      }}
                      data-testid="button-paste-option"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Text
                    </Button>
                  </div>
                )}

                {!showPasteOption ? (
                  <Card className="p-1 bg-card/80 backdrop-blur-sm border-primary/20">
                    <UploadZone
                      onFileSelect={setResumeFile}
                      isLoading={isLoading}
                    />
                  </Card>
                ) : (
                  <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
                    <Textarea
                      placeholder="Paste your resume text here..."
                      value={resumeText}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length > MAX_RESUME_LENGTH) {
                          setResumeText(value.substring(0, MAX_RESUME_LENGTH));
                        } else {
                          setResumeText(value);
                        }
                      }}
                      rows={10}
                      className="resize-none font-mono text-sm"
                      data-testid="textarea-resume-paste"
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      {resumeText.length} / {MAX_RESUME_LENGTH} characters
                    </p>
                  </Card>
                )}

                {(resumeFile || resumeText.trim()) && !isLoading && (
                  <div className="space-y-4">
                    {/* Job Description */}
                    <Card className="p-6 bg-card/80 backdrop-blur-sm">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-primary" />
                        Job Description <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <Textarea
                        placeholder="Paste the job description here to get targeted feedback..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={5}
                        className="resize-none"
                        data-testid="textarea-job-description"
                      />
                    </Card>

                    {/* Roast Button */}
                    <Button
                      onClick={handleRoast}
                      size="lg"
                      className="w-full h-14 text-lg shadow-lg shadow-primary/25"
                      data-testid="button-roast"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Roast My Resume
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}

                {isLoading && (
                  <Card className="p-6 space-y-4 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <div className="flex-1">
                        <p className="font-semibold">{loadingMessage}</p>
                        <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
                      </div>
                    </div>
                    <Progress value={loadingProgress} className="h-2" />
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three powerful features to help you land your dream job
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="p-8 space-y-4 hover-elevate"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
