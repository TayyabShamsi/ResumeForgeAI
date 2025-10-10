import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InterviewQuestion } from "@/components/InterviewQuestion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//todo: remove mock functionality
const mockQuestions = {
  behavioral: [
    {
      question: "Tell me about a time when you had to deal with a difficult stakeholder or client.",
      category: "Behavioral" as const,
      reason: "They want to assess your communication skills, conflict resolution abilities, and professionalism under pressure.",
      sampleAnswer: "In my previous role as a Product Manager, I worked with a stakeholder who was resistant to our new feature prioritization. I scheduled a one-on-one meeting to understand their concerns, shared data showing user impact, and collaboratively revised the roadmap to address their key business needs while maintaining our product vision. This resulted in their full support and a 30% faster feature adoption rate.",
      talkingPoints: [
        "Start with the specific situation and stakeholder",
        "Explain the challenge or conflict clearly",
        "Describe your approach to resolution",
        "Quantify the positive outcome"
      ]
    },
    {
      question: "Describe a situation where you failed and what you learned from it.",
      category: "Behavioral" as const,
      reason: "Testing your self-awareness, ability to learn from mistakes, and growth mindset.",
      sampleAnswer: "Early in my career, I launched a feature without proper user testing, assuming I understood user needs. It had poor adoption. I learned to validate assumptions with data, implemented A/B testing processes, and now involve users early in the design phase. This approach has led to 3x higher feature adoption rates in subsequent launches.",
      talkingPoints: [
        "Be genuine - choose a real failure",
        "Focus on what you learned",
        "Demonstrate how you've changed",
        "Show positive results from applying lessons learned"
      ]
    }
  ],
  technical: [
    {
      question: "How would you optimize a slow-performing database query?",
      category: "Technical" as const,
      reason: "Testing your technical problem-solving skills and understanding of database performance optimization.",
      sampleAnswer: "I would start by analyzing the query execution plan to identify bottlenecks. Common optimizations include: adding appropriate indexes, reviewing JOIN operations, optimizing WHERE clauses, and considering query result caching. I'd also check for N+1 query problems and consider database-specific features like materialized views or partitioning for large datasets.",
      talkingPoints: [
        "Mention profiling and analysis tools",
        "Discuss indexing strategies",
        "Reference specific optimization techniques",
        "Include monitoring and testing approach"
      ]
    }
  ],
  situational: [
    {
      question: "What would you do if you disagreed with your manager's technical decision?",
      category: "Situational" as const,
      reason: "Evaluating your ability to navigate disagreements professionally while maintaining healthy working relationships.",
      sampleAnswer: "I would first ensure I fully understand their reasoning by asking clarifying questions. Then, I'd present my alternative approach with data, potential risks/benefits, and business impact. If they still prefer their approach, I'd implement it professionally while documenting my concerns. I'd also propose a plan to monitor outcomes so we can learn and adjust if needed.",
      talkingPoints: [
        "Show respect for authority while maintaining your perspective",
        "Emphasize data-driven discussion",
        "Demonstrate flexibility and professionalism",
        "Include follow-up and learning mindset"
      ]
    }
  ],
  curveball: [
    {
      question: "If you were an animal, which one would you be and why?",
      category: "Curveball" as const,
      reason: "Testing your ability to think on your feet and reveal personality traits in a creative way.",
      sampleAnswer: "I'd be a dolphin - intelligent, collaborative, and adaptable. Dolphins work in pods to solve complex problems, communicate effectively, and adapt to changing ocean conditions. Similarly, I thrive in team environments, value clear communication, and excel at navigating changing project requirements.",
      talkingPoints: [
        "Choose an animal that aligns with job requirements",
        "Connect traits to professional strengths",
        "Keep it brief and positive",
        "Show personality while staying professional"
      ]
    }
  ]
};

export default function InterviewPrep() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  const allQuestions = [
    ...mockQuestions.behavioral,
    ...mockQuestions.technical,
    ...mockQuestions.situational,
    ...mockQuestions.curveball
  ];

  const handleDownloadPDF = () => {
    console.log("Downloading interview prep guide as PDF");
    //todo: remove mock functionality - implement PDF generation with jsPDF
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
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} data-testid="button-download-pdf">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/results")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Interview Preparation</h1>
            <p className="text-lg text-muted-foreground mt-2">
              {allQuestions.length} personalized questions based on your resume
            </p>
          </div>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="tab-all">All ({allQuestions.length})</TabsTrigger>
            <TabsTrigger value="behavioral" data-testid="tab-behavioral">Behavioral ({mockQuestions.behavioral.length})</TabsTrigger>
            <TabsTrigger value="technical" data-testid="tab-technical">Technical ({mockQuestions.technical.length})</TabsTrigger>
            <TabsTrigger value="situational" data-testid="tab-situational">Situational ({mockQuestions.situational.length})</TabsTrigger>
            <TabsTrigger value="curveball" data-testid="tab-curveball">Curveball ({mockQuestions.curveball.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {allQuestions.map((q, index) => (
              <InterviewQuestion key={index} {...q} />
            ))}
          </TabsContent>

          <TabsContent value="behavioral" className="space-y-4 mt-6">
            {mockQuestions.behavioral.map((q, index) => (
              <InterviewQuestion key={index} {...q} />
            ))}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4 mt-6">
            {mockQuestions.technical.map((q, index) => (
              <InterviewQuestion key={index} {...q} />
            ))}
          </TabsContent>

          <TabsContent value="situational" className="space-y-4 mt-6">
            {mockQuestions.situational.map((q, index) => (
              <InterviewQuestion key={index} {...q} />
            ))}
          </TabsContent>

          <TabsContent value="curveball" className="space-y-4 mt-6">
            {mockQuestions.curveball.map((q, index) => (
              <InterviewQuestion key={index} {...q} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
