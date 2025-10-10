# ResumeForge AI

## Overview

ResumeForge AI is a professional full-stack resume optimization web application that leverages AI to provide resume analysis, ATS compatibility checks, and interview preparation tools. The application analyzes uploaded resumes, provides brutally honest feedback with actionable improvements, generates tailored interview questions, and helps users optimize their professional profiles.

**Core Purpose**: Transform job seekers' resumes through AI-powered analysis and provide comprehensive interview preparation to help them land their dream jobs.

**Key Features**:
- Resume upload (file or pasted text up to 10,000 characters) with AI-powered analysis ("roasting")
- ATS compatibility scoring and keyword optimization
- Before/after section improvements
- AI-generated interview questions (behavioral, technical, situational)
- Interactive interview coaching chatbot (scoped to Interview Prep page only)
- LinkedIn profile optimization (placeholder page created)
- Cover letter generation (placeholder page created)

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 10, 2025)

### Latest Updates
- **Paste Resume Feature**: Added ability to paste resume text (max 10,000 characters) as alternative to file upload with toggle buttons
- **Navigation Expansion**: Added LinkedIn Profile and Cover Letter pages to both sidebar and mobile floating nav (5-item grid)
- **Branding Update**: Removed "Powered by Gemini" text, replaced with "AI-Powered Career Tools"
- **Placeholder Pages**: Created Coming Soon pages for LinkedIn and Cover Letter features with feature previews

### Previous Updates
- Full navigation system with collapsible sidebar, floating mobile nav, and smooth page transitions
- AI Interview Coach chatbot (scoped to Interview Prep page only) with STAR method guidance, confidence tips, and salary negotiation
- Visual polish with hero images and professional stock photography
- Improved upload zone with drag-and-drop functionality

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite as the build tool and development server

**Routing**: Wouter for lightweight client-side routing with five main pages:
- `/` - Resume upload (file or paste text) and job description input
- `/results` - Analysis results with scores, feedback, and improvements
- `/interview-prep` - Generated interview questions with AI coaching chatbot
- `/linkedin` - LinkedIn profile optimization (placeholder/coming soon)
- `/cover-letter` - AI cover letter generator (placeholder/coming soon)

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui component library (New York style variant) for pre-built, customizable components
- TailwindCSS for utility-first styling with custom design tokens
- Custom theming system supporting dark/light modes via ThemeProvider context

**State Management**:
- React Query (TanStack Query) for server state management, caching, and API interactions
- Local component state with useState/useEffect for UI interactions
- Custom hooks for reusable logic (useIsMobile, useToast)

**Design System**:
- Color palette with HSL variables for theming (dark mode primary, light mode support)
- Purple/blue gradient accent theme (262° 83% 58% primary, 217° 91% 60% secondary)
- Typography: Inter for UI, JetBrains Mono for code/metrics
- Spacing primitives based on Tailwind's 4px scale (4, 6, 8, 12, 16, 24)
- 12-column responsive grid system with mobile-first breakpoints

**Key Architectural Decisions**:
- **Component Organization**: Atomic design with reusable UI components in `/components/ui`, feature components in `/components`, and page components in `/pages`
- **Type Safety**: Full TypeScript implementation with strict mode enabled
- **Accessibility**: Built on Radix UI primitives ensuring WCAG compliance
- **Responsive Design**: Mobile-first with floating navigation for mobile (5-item grid), collapsible sidebar for desktop using Radix Sidebar component

**Navigation System**:
- Desktop: Collapsible sidebar with smooth transitions and theme toggle in header
- Mobile: Bottom floating navigation bar with 5 items (Upload, Results, Interview, LinkedIn, Cover)
- Scroll-to-top button appears on both mobile and desktop when scrolling down

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**API Structure**: RESTful API with `/api` prefix for all endpoints (currently scaffolded but not fully implemented)

**Development Features**:
- Custom middleware for request/response logging
- Vite integration in development mode for HMR and fast refresh
- Production build with esbuild for server code bundling

**Key Architectural Decisions**:
- **API-First Design**: Clear separation between frontend and backend with `/api` route prefix
- **Modular Route Registration**: Routes registered through `registerRoutes()` function for extensibility
- **Error Handling**: Centralized error middleware with status code and message handling
- **Development Experience**: Vite middleware mode for seamless SSR and client-side routing in development

### Data Storage

**Database**: PostgreSQL (via Neon serverless)
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling with `@neondatabase/serverless`
- Migration support with Drizzle Kit

**Current Schema** (Basic scaffold):
- `users` table with id (UUID), username, password fields
- Zod validation schemas for type safety and runtime validation

**Storage Interface**:
- Abstract `IStorage` interface for CRUD operations
- In-memory implementation (`MemStorage`) for development/testing
- Designed for easy swapping to PostgreSQL implementation

**Key Architectural Decisions**:
- **Type-Safe ORM**: Drizzle provides compile-time type safety and minimal runtime overhead
- **Schema-First Design**: Database schema defined in TypeScript, migrations generated automatically
- **Environment-Based Configuration**: Database URL from environment variables for security and portability

### Authentication & Session Management

**Planned Architecture** (scaffolded):
- Session-based authentication using `connect-pg-simple` for PostgreSQL session store
- Express session middleware for cookie-based sessions
- User schema with bcrypt password hashing (to be implemented)

## External Dependencies

### AI Services
- **Google Gemini 1.5 Flash API** (`@google/genai`): Primary AI service for resume analysis, feedback generation, and interview question creation
- API key required: `GEMINI_API_KEY` environment variable

### Document Processing
- **pdf-parse**: Extract text content from PDF resumes
- **mammoth**: Parse DOCX files to extract resume text
- **multer**: Handle multipart/form-data file uploads

### Third-Party Integrations (Planned)
- **ScrapingDog API**: LinkedIn profile scraping for optimization features
  - Endpoint: `https://api.scrapingdog.com/linkedin/profile`
  - API key required: `SCRAPINGDOG_API_KEY` environment variable

### UI & Component Libraries
- **Radix UI**: Headless, accessible component primitives
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, etc.
  - Complete suite of 25+ components for complex UI interactions
- **Shadcn/ui**: Pre-styled component collection built on Radix
- **TailwindCSS**: Utility-first CSS framework with custom configuration
- **React Hook Form** (`@hookform/resolvers`): Form validation with Zod resolver
- **React Dropzone**: File upload drag-and-drop functionality
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization for charts (planned for analytics)

### Database & ORM
- **PostgreSQL**: Via Neon serverless adapter (`@neondatabase/serverless`)
- **Drizzle ORM** (`drizzle-orm`, `drizzle-zod`): Type-safe database toolkit
- **Drizzle Kit**: CLI for migrations and schema management
- Environment variable: `DATABASE_URL` for connection string

### Development Tools
- **Vite**: Fast build tool and dev server with React plugin
- **TypeScript**: Strict type checking with path aliases (`@/*`, `@shared/*`)
- **ESBuild**: Production bundling for server code
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner for Replit environment

### Utility Libraries
- **clsx** + **tailwind-merge**: Conditional className utility
- **class-variance-authority**: Component variant management
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation
- **wouter**: Lightweight client-side routing