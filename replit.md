# Expert Directory Application

## Overview
This project is an expert directory web application designed to connect users with industry professionals across various fields like tax, legal, finance, and business consulting. It features a searchable, filterable interface displaying expert information sourced from Google Sheets. The application aims for high utility and scannability, serving as a comprehensive platform for discovering and interacting with experts. The business vision is to provide a streamlined, efficient tool for professional networking and consultation discovery, with market potential in various professional services sectors.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18+ and TypeScript**, using **Wouter** for routing, and **TanStack Query v5** for server state management. **shadcn/ui** (New York style) provides UI components, styled with **Tailwind CSS** using custom design tokens and a Material Design approach. **Vite** is used for development and optimized builds. The design system emphasizes a card-based layout, responsive grid (1-3 columns), pill-based category filters, and pagination (6 experts per page). Typography uses **Montserrat** (primary) and **Lato** (secondary). A custom HSL color system with CSS variables supports theming, and spacing follows Tailwind's 2/4/6/8 unit system. A content block system supports 7 widget types for rich content composition below expert listings.

### Backend Architecture
The backend uses **Node.js with Express.js** and **TypeScript** compiled to ESM. It implements **RESTful APIs** serving JSON, with **Zod** for data validation. **esbuild** handles production bundling. The server includes Express middleware for JSON parsing, request logging, and a modular route registration pattern. An in-memory caching layer is implemented for performance.

### Data Storage Solutions
The primary data source is **Google Sheets**, integrated via API v4 with OAuth2 authentication using Replit Connectors. A 5-minute cache duration balances data freshness and API quotas. An in-memory caching strategy automatically refreshes data and provides a fallback if the Google Sheets API fails.

**Expert Data Schema (Experts!A:L)**:
- `firstName`, `lastName`, `credentials` (optional), `email`, `city`, `state`, `category`, `group`, `specialty` (optional), `isPublished` ("Yes" to show), `url` (optional, auto-normalized to https://), `privacyDate` (ISO timestamp).

**Expert Categories Reference (Expert Categories!A:B)**:
- Lists category names and specialty options for validation.

**Content Management System (Content!A:F)**:
- Google Sheets-based with a schema including `title`, `content`, `order`, `type` (widget type), `imageUrl` (optional), `secondaryContent` (optional).
- Supported widget types: `text`, `image`, `hero`, `two-column`, `cards`, `image-text`.

### Authentication and Authorization
The application currently supports read-only access without user authentication. Authorization for Google Sheets access is handled via:
- **Development (Replit)**: Replit's identity tokens and Google Sheets OAuth credentials through Replit Connectors.
- **Production (Vercel/External)**: Google Service Account authentication with JSON credentials stored in `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable, requiring `spreadsheets.readonly` scope.

## External Dependencies

### Third-Party Services
1.  **Google Sheets API**: Primary data source for expert listings and content blocks.
    -   Spreadsheet ID: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`
    -   Requires OAuth2 (Replit) or Service Account (Vercel/External) for `spreadsheets.readonly` access.
2.  **Replit Platform Services**: Used for Google Sheets Connector API, development tooling, and identity tokens.

### UI Component Libraries
-   **Radix UI**: Primitives for accessible, unstyled components.
-   **Lucide React**: For iconography.

### Styling & Utilities
-   **Tailwind CSS v3** with PostCSS.
-   **class-variance-authority**: For component variant management.
-   **clsx & tailwind-merge**: For conditional class handling.
-   **date-fns**: For date manipulation.

### Developer Experience
-   **TypeScript**: For type safety.
-   **ESBuild**: For fast production builds.

## Color System (WCAG Compliant)

The application uses a carefully designed color palette that meets WCAG AAA accessibility standards:

**Primary Palette:**
- **Primary**: #1F406F (HSL: 215 56% 28%) - Deep blue for buttons, links, and primary accents
- **Dark Neutral Text**: #2F3136 (HSL: 224 7% 20%) - Main foreground text color
- **Secondary Text**: #3A3A3A (HSL: 0 0% 23%) - Muted/secondary text (muted-foreground)
- **Light Background**: #F8F9FB (HSL: 220 33% 98%) - Main page background
- **Card Background**: #FAFAFA (HSL: 0 0% 98%) - Card and panel backgrounds
- **Badge Background**: #E5ECF5 (HSL: 214 40% 93%) - Light blue background for category badges
- **Badge Text/Border**: #1F406F (primary color) - Text and border for badges

**Contrast Ratios (WCAG AAA Compliant):**
- Primary text on light background: ≈ 9:1
- Primary text on badge background: ≈ 8.7:1
- Secondary text on background: ≈ 10:1

All contrast ratios exceed WCAG AA standards (4.5:1 for normal text, 3:1 for large text) and meet AAA standards where applicable.

## Recent Changes

- **2025-11-14**: Set IsPublished flag to default to "Yes" on form submission
  - Updated both submission handlers (api/submit-expert.ts and server/googleSheets.ts) to set IsPublished="Yes" in column J
  - New expert submissions are now immediately visible in the directory without manual approval
  - Implemented cache invalidation in development environment to ensure new experts appear immediately after submission
  - Note: Production (Vercel) uses serverless functions with stateless execution, so caching behavior differs from development
- **2025-11-14**: Updated color system for WCAG compliance
  - Implemented new color palette with verified WCAG AAA contrast ratios
  - Updated all CSS variables in index.css for light mode
  - Primary color: #1F406F (deep blue) used throughout for consistency
  - Badge styling: light blue background (#E5ECF5) with primary text (#1F406F)
  - Background colors: #F8F9FB (page) and #FAFAFA (cards) for subtle contrast
  - Text colors: #2F3136 (primary) and #3A3A3A (secondary) for optimal readability
  - All changes tested and verified for visual consistency and accessibility
- **2025-11-14**: Updated registration thank you page copy
  - Changed thank you message to: "Thank you for joining. Visit https://expert.valucompass.com to view your entry under the category you selected. For any questions, contact support@valucompass.com."
  - Replaced dynamic root URL with fixed production URL: https://expert.valucompass.com
- **2025-11-13**: Improved expert card display and registration thank you page
  - Removed globe icon from upper right corner of expert cards
  - Moved URL/website link to display under email as "Visit Website" with ExternalLink icon (opens in new tab)
  - Email address remains displayed on cards (as plain text)
  - Removed "Copy Email" button and all related copy-to-clipboard functionality
  - Expert card display order (top to bottom): Name/Credentials → Location → Email → Visit Website link → Category badge → Specialty