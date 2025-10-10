import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [, setLocation] = useLocation();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoast = () => {
    if (!resumeFile) return;
    
    console.log("Roasting resume:", resumeFile.name);
    console.log("Job description:", jobDescription);
    
    //todo: remove mock functionality - simulate loading and redirect to results
    setIsLoading(true);
    setTimeout(() => {
      setLocation("/results");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-border bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                ResumeForge AI
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-chart-2/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="text-center space-y-8 mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Get Your Resume{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Roasted
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered brutally honest feedback, ATS compatibility checks, and personalized interview prep to land your dream job
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <UploadZone
              onFileSelect={setResumeFile}
              isLoading={isLoading}
            />

            {resumeFile && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between p-4 bg-card border border-card-border rounded-lg">
                  <span className="text-sm font-medium">{resumeFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                    data-testid="button-remove-file"
                  >
                    Remove
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Job Description <span className="text-muted-foreground">(Optional but recommended)</span>
                  </label>
                  <Textarea
                    placeholder="Paste the job description here to get targeted feedback and keyword analysis..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    data-testid="textarea-job-description"
                  />
                </div>

                <Button
                  onClick={handleRoast}
                  disabled={isLoading}
                  className="w-full h-12 text-lg shadow-lg shadow-primary/25"
                  data-testid="button-roast"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Analyzing Resume...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Roast My Resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 ResumeForge AI. Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
