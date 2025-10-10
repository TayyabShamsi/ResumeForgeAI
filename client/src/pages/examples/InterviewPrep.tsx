import InterviewPrep from "../InterviewPrep";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function InterviewPrepExample() {
  return (
    <ThemeProvider>
      <InterviewPrep />
      <Toaster />
    </ThemeProvider>
  );
}
