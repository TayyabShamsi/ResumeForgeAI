import Home from "../Home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function HomeExample() {
  return (
    <ThemeProvider>
      <Home />
      <Toaster />
    </ThemeProvider>
  );
}
