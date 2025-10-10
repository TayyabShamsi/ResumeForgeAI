# ResumeForge AI - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from modern productivity tools (Grammarly, Notion, Linear) combined with data visualization best practices. The design balances professional credibility with approachable personality to make resume optimization engaging rather than intimidating.

## Color Palette

### Dark Mode (Primary)
- **Background**: 222 47% 11% (deep charcoal)
- **Surface**: 222 47% 15% (elevated panels)
- **Surface Elevated**: 222 47% 18% (cards, modals)
- **Primary**: 150 75% 50% (emerald green - growth, success)
- **Secondary**: 270 80% 60% (rich violet - creativity, premium)
- **Success**: 45 90% 60% (gold - achievement, premium feel)
- **Warning**: 30 92% 60% (tangerine - attention states)
- **Destructive**: 355 85% 60% (crimson - roast/fail)
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 0 0% 71%
- **Text Muted**: 0 0% 55%
- **Border**: 222 47% 25%

### Light Mode
- **Background**: 0 0% 100%
- **Surface**: 0 0% 98%
- **Surface Elevated**: 0 0% 100%
- **Primary**: 150 75% 50% (emerald green - growth, success)
- **Secondary**: 270 80% 60% (rich violet - creativity, premium)
- **Success**: 45 90% 55% (gold - achievement, premium feel)
- **Warning**: 30 92% 58% (tangerine - attention states)
- **Destructive**: 355 85% 58% (crimson - roast/fail)
- **Text Primary**: 222 47% 11%
- **Text Secondary**: 222 20% 35%
- **Border**: 0 0% 89%

### Gradients
- **Hero**: linear-gradient(135deg, emerald → violet)
- **Card Accents**: subtle radial gradients from emerald at 10% opacity
- **Score Animations**: conic gradients for circular progress (gold for high scores)

## Typography
- **Headings**: Inter (600-700 weight), tight leading (-0.02em tracking for large sizes)
- **Body**: Inter (400-500 weight), relaxed leading (1.6)
- **Code/Data**: JetBrains Mono for scores, technical details
- **Scale**: text-sm (14px) body, text-base (16px) important text, text-4xl+ for hero headlines

## Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 24 (e.g., p-4, gap-6, mt-8, py-12, px-16, space-y-24)

### Grid Structure
- **Container**: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- **Columns**: Use 12-column grid for complex layouts, 2-3 column grids for features/questions
- **Gutters**: gap-6 on mobile, gap-8 on desktop

## Component Library

### Navigation
- **Navbar**: Sticky top, backdrop-blur-lg, border-b, 64px height
- Logo left, navigation center, CTA button right
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- **Layout**: Full-width gradient background (purple to blue 135deg), min-h-[80vh]
- **Content**: Centered headline + subheadline + drag-drop upload zone
- **Image**: Abstract 3D illustration of documents/AI (floating, subtle animation), positioned right side on desktop
- Visual elements: Floating icons (resume, checkmark, star) with subtle parallax

### Upload Zone
- **Default**: Dashed border (border-2 border-dashed), rounded-2xl, p-12, hover:border-primary transition
- **Active Drag**: border-primary bg-primary/5 scale-[1.02]
- **Icon**: Cloud upload icon, text-6xl text-muted
- **Copy**: "Drag & drop your resume" (text-xl) + "PDF or DOCX, max 5MB" (text-sm text-muted)

### Results Dashboard
- **Layout**: Grid with score circle (left 1/3), metrics cards (right 2/3)
- **Score Circle**: 200px diameter, conic-gradient progress, animated on reveal, large number in center (text-5xl font-bold)
- **Metric Cards**: Grid of 2x2 cards (ATS badge, keyword count, sections analyzed, improvement score)
- Each card: rounded-xl, p-6, border, hover:border-primary transition

### Roast Display
- **Container**: Space-y-4, max-w-4xl
- **Roast Item**: Flex row, gap-3, p-4, rounded-lg, bg-surface
- **Icon**: 🔥 for criticisms (text-destructive), ✨ for strengths (text-success)
- **Text**: font-medium for the roast, text-sm text-muted for explanation

### Before/After Sections
- **Layout**: Two-column grid (gap-6), each column rounded-lg border p-6
- **Before**: border-destructive/20 bg-destructive/5
- **After**: border-success/20 bg-success/5
- **Label**: Pill badge at top ("Before" | "After"), arrow between columns

### Interview Questions
- **Card**: Expandable accordion, rounded-lg border hover:border-primary transition
- **Header**: Flex justify-between, p-4, cursor-pointer
- **Badge**: Category badge (Behavioral/Technical/Situational) with color coding
- **Content**: p-6 pt-0, space-y-4 when expanded
- **Answer Toggle**: Button with "Show Answer" / "Hide Answer", text-sm
- **Copy Button**: Ghost button with clipboard icon, absolute top-right

### LinkedIn Optimizer
- **Headline Comparison**: Two cards side-by-side, current (muted) vs suggested (highlighted)
- **About Section**: Textarea with 200 word count, editable, rounded-lg border-2
- **Skills Checklist**: Checkbox list with items, gap-2, wrap
- **Post Ideas**: Card grid (2 columns), each with gradient border-top, p-6, copy button

### Buttons
- **Primary**: bg-primary hover:bg-primary-hover, text-white, rounded-lg px-6 py-3, font-medium, shadow-lg shadow-primary/25
- **Secondary**: border-2 border-primary text-primary hover:bg-primary/10
- **Ghost**: hover:bg-surface text-muted hover:text-primary
- **Icon Buttons**: p-2 rounded-lg hover:bg-surface

### Loading States
- **Skeleton**: Animate-pulse bg-surface rounded, various sizes mimicking content
- **Progress Messages**: Fixed bottom-right toast-style, backdrop-blur, slide-in animation
- **Spinner**: Circular spinner with gradient border (primary → secondary)

### Animations
- **Score Reveal**: Count-up animation (0→100) over 2s with easing
- **Card Entry**: Stagger animation (each card delays 100ms), slide-up + fade-in
- **Progress Circle**: Stroke-dashoffset animation, 1.5s ease-out
- **Button Hover**: Scale-[1.02] + shadow increase, 200ms transition
- **Page Transitions**: Fade + slight slide (20px), 300ms

## Images
- **Hero Image**: 3D rendered resume document with AI sparkles, floating on right side (600x700px area), subtle float animation
- **Feature Icons**: Use Heroicons throughout (outline style for light states, solid for active)
- **Testimonial Avatars**: Placeholder gradients (purple to blue) with initials, rounded-full
- **Empty States**: Minimal illustrations for "no results" states

## Accessibility
- All interactive elements: min-height 44px (touch target)
- Focus rings: ring-2 ring-primary ring-offset-2 ring-offset-background
- Color contrast: Maintain 4.5:1 minimum for all text
- Dark mode: Consistent across all components including form inputs
- Loading states: Announce with aria-live="polite"

## Responsive Breakpoints
- **Mobile** (<640px): Single column, stacked cards, full-width buttons, drawer navigation
- **Tablet** (640-1024px): 2-column grids, condensed spacing
- **Desktop** (>1024px): Full multi-column layouts, expanded spacing, fixed sidebar potential

## Key Principles
1. **Professional Trust**: Clean layouts, ample whitespace, consistent shadows establish credibility
2. **Engaging Feedback**: Animated scores and colorful categorization make data digestible
3. **Efficient Scanning**: Strong hierarchy, clear labels, grouped information for quick comprehension
4. **Delightful Details**: Micro-interactions on hover, smooth transitions, thoughtful loading states