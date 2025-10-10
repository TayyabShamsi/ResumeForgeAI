import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, Sparkles, ArrowRight } from "lucide-react";

export default function LinkedInProfile() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm font-medium text-primary" data-testid="badge-linkedin-optimization">
              <Linkedin className="h-4 w-4" />
              LinkedIn Optimization
            </div>
            <h1 className="text-3xl md:text-4xl font-bold" data-testid="heading-linkedin-title">
              Optimize Your LinkedIn Profile
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-linkedin-description">
              AI-powered LinkedIn profile analysis and optimization coming soon
            </p>
          </div>

          <Card className="p-8 md:p-12 text-center" data-testid="card-linkedin-coming-soon">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto" data-testid="icon-linkedin-sparkles">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold" data-testid="heading-coming-soon">Coming Soon</h2>
                <p className="text-muted-foreground" data-testid="text-feature-intro">
                  We're building an amazing LinkedIn profile optimizer that will help you:
                </p>
              </div>
              <ul className="text-left space-y-3 mt-6">
                <li className="flex items-start gap-2" data-testid="feature-headline">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Optimize your headline and summary</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-experience">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Enhance your work experience descriptions</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-skills">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Suggest relevant skills and endorsements</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-visibility">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Improve your profile visibility</span>
                </li>
              </ul>
              <Button className="mt-6" disabled data-testid="button-notify">
                <Sparkles className="mr-2 h-4 w-4" />
                Notify Me When Ready
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
