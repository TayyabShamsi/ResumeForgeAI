import Results from "../Results";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function ResultsExample() {
  return (
    <ThemeProvider>
      <Results />
      <Toaster />
    </ThemeProvider>
  );
}
