import { useState } from "react";
import { useLocation } from "wouter";
import { Download, ArrowLeft, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewQuestion } from "@/components/InterviewQuestion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { AIChatBot } from "@/components/AIChatBot";
import interviewImage from "@assets/generated_images/AI_interview_preparation_visualization_64de33b7.png";

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
  };

  const categoryStats = {
    behavioral: mockQuestions.behavioral.length,
    technical: mockQuestions.technical.length,
    situational: mockQuestions.situational.length,
    curveball: mockQuestions.curveball.length,
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Header with Custom Image */}
        <div className="relative h-56 overflow-hidden border-b">
          <img 
            src={interviewImage} 
            alt="Interview preparation" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20" />
          <div className="absolute inset-0 flex items-end pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/results")}
                data-testid="button-back"
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-7 w-7 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold">Interview Preparation</h1>
              </div>
              <p className="text-muted-foreground">
                {allQuestions.length} AI-generated questions based on your resume
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Practice these questions to ace your interview
            </p>
            <Button variant="outline" onClick={handleDownloadPDF} data-testid="button-download-pdf">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <Card
                key={category}
                className="p-6 hover-elevate cursor-pointer"
                onClick={() => setActiveTab(category)}
                data-testid={`card-category-${category}`}
              >
                <p className="text-sm text-muted-foreground capitalize mb-1">{category}</p>
                <p className="text-3xl font-bold">{count}</p>
              </Card>
            ))}
          </div>

          {/* Tabs for filtering */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Filter by category</span>
            </div>
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="behavioral" data-testid="tab-behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="technical" data-testid="tab-technical">Technical</TabsTrigger>
              <TabsTrigger value="situational" data-testid="tab-situational">Situational</TabsTrigger>
              <TabsTrigger value="curveball" data-testid="tab-curveball">Curveball</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {allQuestions.map((q, index) => (
                <InterviewQuestion key={index} {...q} />
              ))}
            </TabsContent>

            <TabsContent value="behavioral" className="space-y-4">
              {mockQuestions.behavioral.map((q, index) => (
                <InterviewQuestion key={index} {...q} />
              ))}
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              {mockQuestions.technical.map((q, index) => (
                <InterviewQuestion key={index} {...q} />
              ))}
            </TabsContent>

            <TabsContent value="situational" className="space-y-4">
              {mockQuestions.situational.map((q, index) => (
                <InterviewQuestion key={index} {...q} />
              ))}
            </TabsContent>

            <TabsContent value="curveball" className="space-y-4">
              {mockQuestions.curveball.map((q, index) => (
                <InterviewQuestion key={index} {...q} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AIChatBot />
    </PageTransition>
  );
}
