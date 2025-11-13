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