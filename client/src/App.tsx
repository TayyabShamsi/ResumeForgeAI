import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavigationWrapper } from "@/components/NavigationWrapper";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import InterviewPrep from "@/pages/InterviewPrep";
import LinkedInProfile from "@/pages/LinkedIn";
import CoverLetter from "@/pages/CoverLetter";
import Pricing from "@/pages/Pricing";
import Settings from "@/pages/Settings";
import Success from "@/pages/Success";
import Cancel from "@/pages/Cancel";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/results" component={Results} />
      <Route path="/interview-prep" component={InterviewPrep} />
      <Route path="/linkedin" component={LinkedInProfile} />
      <Route path="/cover-letter" component={CoverLetter} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/settings" component={Settings} />
      <Route path="/success" component={Success} />
      <Route path="/cancel" component={Cancel} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <NavigationWrapper>
            <Router />
          </NavigationWrapper>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
