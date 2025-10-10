import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileEdit, Sparkles, Download, Copy, ArrowRight } from "lucide-react";
import coverLetterImage from "@assets/generated_images/AI_cover_letter_generator_interface_9eea379b.png";

export default function CoverLetter() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedLetter(`Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle || "position"} at ${companyName || "your company"}. With my proven track record in software development and passion for creating innovative solutions, I am confident I would be a valuable addition to your team.

Throughout my career, I have consistently demonstrated my ability to deliver high-quality results while collaborating effectively with cross-functional teams. My experience aligns perfectly with the requirements outlined in your job description, particularly in areas of technical leadership, problem-solving, and driving product innovation.

What excites me most about this opportunity at ${companyName || "your company"} is the chance to contribute to meaningful projects that impact users at scale. I am particularly impressed by your company's commitment to innovation and would be thrilled to bring my skills in React, Node.js, and cloud architecture to support your goals.

I am eager to discuss how my background, skills, and enthusiasm can contribute to the continued success of your team. Thank you for considering my application. I look forward to the opportunity to speak with you further.

Best regards,
[Your Name]`);
      setIsGenerating(false);
    }, 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    a.click();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative h-72 overflow-hidden border-b">
          <img 
            src={coverLetterImage} 
            alt="AI Cover Letter Generator" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/90 to-secondary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-sm font-semibold text-primary backdrop-blur-sm" data-testid="badge-cover-letter">
                <FileEdit className="h-5 w-5" />
                AI Cover Letter Generator
              </div>
              <h1 className="text-5xl font-bold" data-testid="heading-cover-letter-title">
                Generate Perfect Cover Letters
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-cover-letter-description">
                AI-powered cover letters tailored to any job in seconds
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Job Details</h2>
                <p className="text-muted-foreground">
                  Provide information about the position you're applying for
                </p>
              </div>

              <Card className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Job Title
                  </label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    data-testid="input-job-title"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Company Name
                  </label>
                  <Input
                    placeholder="e.g., Tech Company Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    data-testid="input-company-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Job Description (Optional)
                  </label>
                  <Textarea
                    placeholder="Paste the job description here for a more tailored cover letter..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    data-testid="textarea-job-description"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Tone
                  </label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger data-testid="select-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!jobTitle || !companyName || isGenerating}
                  className="w-full"
                  size="lg"
                  data-testid="button-generate-letter"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Cover Letter</h2>
                  <p className="text-muted-foreground">
                    {generatedLetter ? "Edit and customize as needed" : "Your AI-generated letter will appear here"}
                  </p>
                </div>
                {generatedLetter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy-letter">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download-letter">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              <Card className="p-6 min-h-[500px]">
                {generatedLetter ? (
                  <Textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="min-h-[460px] font-serif text-base leading-relaxed resize-none"
                    data-testid="textarea-generated-letter"
                  />
                ) : (
                  <div className="h-[460px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <FileEdit className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Ready to Create</p>
                        <p className="text-sm text-muted-foreground">
                          Fill in the job details to generate your cover letter
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Tips Section */}
          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <h3 className="text-xl font-bold mb-4">Cover Letter Tips</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Be Specific</p>
                  <p className="text-sm text-muted-foreground">Reference the company and role directly</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Show Value</p>
                  <p className="text-sm text-muted-foreground">Highlight what you bring to the team</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Keep it Concise</p>
                  <p className="text-sm text-muted-foreground">Aim for 3-4 focused paragraphs</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
