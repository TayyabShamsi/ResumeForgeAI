# ResumeForge AI

## Overview

ResumeForge AI is a professional full-stack resume optimization web application that leverages AI to provide resume analysis, ATS compatibility checks, and interview preparation tools. The application analyzes uploaded resumes, provides brutally honest feedback with actionable improvements, generates tailored interview questions, and helps users optimize their professional profiles.

**Core Purpose**: Transform job seekers' resumes through AI-powered analysis and provide comprehensive interview preparation to help them land their dream jobs.

**Key Features**:
- Resume upload (file or pasted text up to 10,000 characters) with AI-powered analysis ("roasting")
- ATS compatibility scoring and keyword optimization
- Before/after section improvements
- **Complete AI-powered resume rewrite** with side-by-side comparison, PDF download, and copy-to-clipboard
- AI-generated interview questions (behavioral, technical, situational)
- Interactive interview coaching chatbot (scoped to Interview Prep page only)
- LinkedIn profile optimization (fully functional with AI)
- Cover letter generation (fully functional with tone options)

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 10, 2025)

### Latest Updates - COMPLETE RESUME REWRITE FEATURE
- **AI-Powered Resume Rewriting**: Added complete resume rewrite functionality with comprehensive optimization
  - Full resume regeneration using AI based on analysis feedback and job requirements
  - Side-by-side comparison view (Original vs AI-Revised) with word counts
  - Editable revised resume textarea for user customization
  - Key changes summary showing all improvements made
  - Download as PDF functionality using jsPDF library
  - Copy to clipboard for easy pasting into Word or other applications
  - Integrated with existing caching and rate limiting systems
- **Backend Implementation**: New POST /api/resume/rewrite endpoint
  - Accepts resume text, job description, and analysis results
  - Returns optimized resume with key changes and word count metrics
  - Comprehensive error handling with user-friendly messages
- **User Experience**: Clean, intuitive workflow
  - Prominent CTA button on Results page after analysis
  - Responsive two-column layout for comparison
  - Toast notifications for copy/download actions
  - "Start Over" option to begin new analysis

### Previous Updates - SUPABASE AUTHENTICATION MIGRATION
- **Supabase Auth Integration**: Migrated from custom JWT to Supabase Auth for production-ready authentication
  - Email/password signup and login with password strength validation
  - Google OAuth support with automatic user creation
  - Password reset flow with email recovery links
  - Session management with httpOnly cookies (access_token + refresh_token)
  - Auto-refresh middleware for seamless 7-day sessions
  - Request-scoped Supabase clients for proper token handling
- **Database Schema Update**: Users table now uses Supabase user IDs as primary keys, removed password fields
- **Security Enhancements**: 
  - HttpOnly cookies with secure flag in production
  - Token rotation on every refresh
  - Automatic token refresh when expired
  - Proper session cleanup on logout

### Previous Updates - PRODUCTION-READY ENHANCEMENTS
- **LinkedIn URL Scraping**: Integrated ScrapingDog API to automatically extract profile data from LinkedIn URLs (headline, about, experience, skills, education)
- **Rate Limiting**: Implemented 10 requests per IP per hour across all API endpoints to prevent abuse
- **Response Caching**: Added intelligent in-memory caching with 5-minute TTL using SHA-256 hashing for unique cache keys
- **Enhanced ATS Analysis**: AI now provides detailed formatting issues, keyword density metrics, and severity-based recommendations
- **Improved Error Handling**: Context-aware error messages for API failures, rate limits, and parsing errors

### Previous Updates - FULLY FUNCTIONAL AI INTEGRATION
- **Real AI Integration Complete**: All features now use Google Gemini 2.0 Flash (experimental) model
  - Resume analysis with brutally honest feedback, ATS scoring, and improvement suggestions
  - AI-generated interview questions (behavioral, technical, situational)
  - LinkedIn profile optimization with actionable suggestions
  - Cover letter generation with tone customization (professional, enthusiastic, formal, creative)
- **Data Flow Fixed**: Resume text properly extracted from PDF/DOCX and passed to all downstream features
- **Backend Implementation**: Complete API endpoints with error handling and fallback responses
- **E2E Testing**: Verified working with real AI responses

### Previous Updates
- **Paste Resume Feature**: Added ability to paste resume text (max 10,000 characters) as alternative to file upload with toggle buttons
- **Navigation Expansion**: Added LinkedIn Profile and Cover Letter pages to both sidebar and mobile floating nav (5-item grid)
- **Branding Update**: Removed "Powered by Gemini" text, replaced with "AI-Powered Career Tools"
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
- `/linkedin` - LinkedIn profile optimization (fully functional with AI)
- `/cover-letter` - AI cover letter generator (fully functional with tone options)

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

**API Structure**: RESTful API with `/api` prefix for all endpoints
- `/api/analyze-resume` - Resume analysis with AI feedback
- `/api/resume/rewrite` - Complete resume rewrite with AI optimization
- `/api/generate-questions` - Interview question generation
- `/api/optimize-linkedin` - LinkedIn profile optimization
- `/api/generate-cover-letter` - Cover letter generation with tone options
- `/api/chat` - AI coaching chatbot for interview prep

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

**Supabase Authentication** (Fully Implemented):
- **Email/Password Auth**: Signup and login with password strength validation (min 8 chars, 1 uppercase, 1 number)
- **Google OAuth**: One-click Google sign-in with automatic user creation in database
- **Password Reset**: Email-based recovery flow with secure token exchange
- **Session Management**: 
  - Access tokens (1 hour expiry) + refresh tokens (7 day expiry) stored in httpOnly cookies
  - Auto-refresh middleware transparently renews sessions when access token expires
  - Request-scoped Supabase clients ensure proper token isolation per request
- **Security Features**:
  - HttpOnly cookies prevent XSS attacks
  - Secure flag enabled in production
  - Token rotation on every refresh
  - Proper session cleanup on logout
- **Database Integration**: 
  - Users table uses Supabase user IDs as primary keys
  - Automatic user record creation after successful authentication
  - Credit tracking per user (resume: 5, interview: 2, linkedin: 1 for free tier)

## External Dependencies

### AI Services
- **Google Gemini 2.0 Flash Experimental** (`@google/genai`): Primary AI service for all features
  - Resume analysis with brutally honest feedback
  - Interview question generation (behavioral, technical, situational)
  - LinkedIn profile optimization
  - Cover letter generation with tone customization
  - AI coaching chatbot
- API key required: `GEMINI_API_KEY` environment variable
- Model: `gemini-2.0-flash-exp`

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