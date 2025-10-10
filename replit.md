# ResumeForge AI

## Overview
ResumeForge AI is a full-stack web application that uses AI to optimize resumes, provide ATS compatibility checks, and offer interview preparation tools. It aims to help job seekers improve their professional profiles and secure employment by analyzing resumes, providing feedback, generating tailored interview questions, and facilitating resume rewrites and LinkedIn profile optimization.

**Key Capabilities**:
- AI-powered resume analysis and "roasting" with actionable feedback.
- ATS compatibility scoring and keyword optimization.
- Complete AI-powered resume rewriting with side-by-side comparison and PDF download.
- AI-generated interview questions (behavioral, technical, situational) and an interactive coaching chatbot.
- LinkedIn profile optimization.
- Cover letter generation with customizable tone.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with Vite.
- **Routing**: Wouter for client-side routing across key pages: Resume Upload, Analysis Results, Interview Preparation, LinkedIn Optimization, and Cover Letter Generation.
- **UI/UX**: Radix UI for accessible primitives, Shadcn/ui for pre-built components (New York style), TailwindCSS for styling with custom design tokens, and a theming system for dark/light modes.
- **State Management**: React Query for server state and caching; local component state via `useState`/`useEffect`.
- **Design System**: HSL-based color palette (purple/blue gradient accent), Inter font for UI, JetBrains Mono for code, 12-column responsive grid, mobile-first design.
- **Architectural Decisions**: Component organization follows atomic design, full TypeScript implementation, WCAG compliance via Radix UI, responsive design with mobile floating navigation and desktop sidebar.

### Backend
- **Runtime**: Node.js with Express.js.
- **API Structure**: RESTful API with a `/api` prefix, handling resume analysis, rewrite, question generation, LinkedIn optimization, cover letter generation, and chatbot interactions.
- **Architectural Decisions**: API-first design, modular route registration, centralized error handling, Vite middleware for development experience.

### Data Storage
- **Database**: PostgreSQL (via Neon serverless) using Drizzle ORM for type-safe queries and schema management.
- **Schema**: Includes a `users` table with Supabase user IDs as primary keys, supporting credit tracking for different tiers.
- **Architectural Decisions**: Type-safe ORM, schema-first design with Drizzle Kit for migrations, environment-based configuration for database connection.

### Authentication & Session Management
- **Provider**: Supabase Authentication.
- **Methods**: Email/password authentication (with strong password validation) and Google OAuth for seamless sign-in.
- **Session Management**: Access tokens (1 hour) and refresh tokens (7 days) stored in httpOnly cookies, with an auto-refresh middleware.
- **Security**: HttpOnly cookies, secure flag in production, token rotation, and proper session cleanup.
- **Features**: Password reset flow via email, automatic user record creation, credit tracking.

## External Dependencies

### AI Services
- **Google Gemini 2.0 Flash Experimental** (`@google/genai`): Powers all AI features including resume analysis, interview question generation, LinkedIn optimization, cover letter generation, and the AI coaching chatbot.

### Document Processing
- **pdf-parse**: Extracts text from PDF files.
- **mammoth**: Parses DOCX files to extract text.
- **multer**: Handles multipart/form-data file uploads.

### Third-Party Integrations
- **ScrapingDog API**: Used for LinkedIn profile data extraction.
- **Stripe**: Integrated for a 3-tier subscription system with checkout, customer portal, and webhook handling for subscription lifecycle events.

### UI & Component Libraries
- **Radix UI**: Headless component primitives.
- **Shadcn/ui**: Pre-styled components built on Radix.
- **TailwindCSS**: Utility-first CSS framework.
- **React Hook Form**: Form validation with Zod resolver.
- **React Dropzone**: Drag-and-drop file uploads.
- **Lucide React**: Icon library.

### Database & ORM
- **PostgreSQL**: Accessed via `@neondatabase/serverless`.
- **Drizzle ORM** (`drizzle-orm`, `drizzle-zod`): Type-safe database toolkit.
- **Drizzle Kit**: For migrations.

### Development Tools
- **Vite**: Fast build tool and dev server.
- **TypeScript**: For type safety.
- **ESBuild**: For production server code bundling.

### Utility Libraries
- **clsx** + **tailwind-merge**: For conditional class names.
- **class-variance-authority**: For component variant management.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **wouter**: Lightweight client-side routing.