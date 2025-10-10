import { useState, useEffect } from "react";
import { Home, FileText, MessageSquare, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, url: "/", label: "Upload" },
  { icon: FileText, url: "/results", label: "Results" },
  { icon: MessageSquare, url: "/interview-prep", label: "Interview" },
];

export function FloatingNav() {
  const [location, setLocation] = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/98 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="grid grid-cols-3 p-1.5">
          {navItems.map((item) => (
            <Button
              key={item.url}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.url)}
              className={cn(
                "flex flex-col gap-0.5 h-auto py-2",
                location === item.url && "text-primary"
              )}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <item.icon className={cn("h-5 w-5", location === item.url && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          size="icon"
          onClick={scrollToTop}
          variant="secondary"
          className="hidden md:flex fixed bottom-24 right-24 z-40 shadow-lg rounded-full w-11 h-11"
          data-testid="button-scroll-top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
