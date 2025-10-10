import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileEdit, Sparkles, ArrowRight } from "lucide-react";
import coverLetterImage from "@assets/stock_images/writing_cover_letter_3b137ac8.jpg";

export default function CoverLetter() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header with Image */}
        <div className="relative h-64 overflow-hidden border-b">
          <img 
            src={coverLetterImage} 
            alt="Professional writing" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-secondary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm font-semibold text-primary backdrop-blur-sm" data-testid="badge-cover-letter">
                <FileEdit className="h-4 w-4" />
                Cover Letter Generator
              </div>
              <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-cover-letter-title">
                AI Cover Letter Generator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-cover-letter-description">
                Generate tailored, professional cover letters in seconds
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-12 text-center hover-elevate" data-testid="card-cover-letter-coming-soon">
            <div className="max-w-xl mx-auto space-y-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto" data-testid="icon-cover-letter-sparkles">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold" data-testid="heading-coming-soon">Coming Soon</h2>
                <p className="text-lg text-muted-foreground" data-testid="text-feature-intro">
                  Our AI cover letter generator will help you:
                </p>
              </div>
              <ul className="text-left space-y-4 mt-8">
                <li className="flex items-start gap-3" data-testid="feature-personalized">
                  <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Create personalized cover letters for any job</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-resume-match">
                  <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Match your resume and highlight key achievements</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-tone">
                  <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Adapt tone and style to company culture</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-export">
                  <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-lg">Export in multiple formats (PDF, DOCX)</span>
                </li>
              </ul>
              <Button size="lg" className="mt-8" disabled data-testid="button-notify">
                <Sparkles className="mr-2 h-5 w-5" />
                Notify Me When Ready
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
