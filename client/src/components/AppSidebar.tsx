import { Home, FileText, MessageSquare, Sparkles, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Upload Resume",
    url: "/",
    icon: Home,
    description: "Start your analysis"
  },
  {
    title: "Resume Analysis",
    url: "/results",
    icon: FileText,
    description: "View feedback & scores"
  },
  {
    title: "Interview Prep",
    url: "/interview-prep",
    icon: MessageSquare,
    description: "Practice questions"
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              ResumeForge AI
            </p>
            <p className="text-xs text-muted-foreground">Your Career Assistant</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    className="group"
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg transition-colors ${
                        location === item.url 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-sidebar-accent/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {location === item.url && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center">
          <p>Powered by Google Gemini AI</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
