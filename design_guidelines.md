# Nsasa Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern academic platforms like Notion and Discord for the dashboard experience, with clean institutional aesthetics similar to university portals. The design balances professional credibility with student-friendly engagement.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Brand Blue: 210 85% 35% (deep academic blue)
- Secondary Blue: 215 70% 45% (lighter accent)
- Success Green: 142 71% 45% (approvals, achievements)
- Warning Orange: 25 85% 55% (pending states)

**Dark Mode:**
- Background: 220 15% 8%
- Surface: 220 10% 12%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 75%

### Typography
- Primary: Inter (headings, UI elements)
- Secondary: Open Sans (body text, descriptions)
- Sizes: text-xs to text-4xl with consistent hierarchy

### Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, and 12
- Tight spacing: p-2, m-2
- Standard spacing: p-4, m-4, gap-4
- Generous spacing: p-8, m-8
- Section spacing: py-12, my-12

### Component Library

**Navigation:**
- Fixed header with Nsasa logo (left) and user avatar/menu (right)
- Sidebar navigation for dashboard pages
- Breadcrumb navigation for deep pages

**Cards:**
- Blog cards with rounded corners (rounded-lg)
- User profile cards with avatar integration
- Resource download cards with file type indicators

**Forms:**
- Clean input fields with floating labels
- Multi-step registration flow
- File upload dropzones with progress indicators

**Data Displays:**
- Admin approval queues with status badges
- Gamification leaderboards with ranking visuals
- Analytics charts using simple bar/line graphs

## Visual Treatment

### Background & Hero
- **Landing Page Hero**: Use provided background image as full-viewport hero with subtle dark overlay (bg-black/30)
- **Logo Placement**: Nsasa logo prominently displayed in header and hero section
- **Gradient Overlays**: Subtle blue gradients (210 85% 35% to 215 70% 45%) for section dividers and call-to-action areas

### Interactive Elements
- Buttons with subtle shadows and hover lift effects
- Card hover states with gentle elevation
- Badge animations for gamification achievements
- Outline buttons on hero images with blurred backgrounds

### Content Sections
**Landing Page (4 sections max):**
1. Hero with background image and value proposition
2. Platform features showcase
3. Recent blog highlights
4. Call-to-action for student registration

**Dashboard Layout:**
- Left sidebar with navigation
- Main content area with personalized widgets
- Right panel for quick actions and notifications

### Responsive Breakpoints
- Mobile-first approach
- Dashboard transforms to tab navigation on mobile
- Card grids collapse to single column on small screens
- Sidebar becomes slide-out menu on tablet/mobile

### Accessibility
- Consistent dark mode across all components
- High contrast ratios for text readability
- Focus states for keyboard navigation
- Screen reader friendly structure

## Images
- **Hero Background**: Full-viewport background image with professional overlay
- **Profile Avatars**: Circular avatars throughout the platform
- **Blog Thumbnails**: 16:9 aspect ratio cards for blog previews
- **File Type Icons**: Visual indicators for PDFs, videos, images in download sections