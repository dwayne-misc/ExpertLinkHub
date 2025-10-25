# Expert Directory Application

## Overview

This is an expert directory web application built to help users discover and connect with industry professionals across various categories including tax, legal, finance, and business consulting. The application features a searchable, filterable card-based interface that displays expert information pulled from Google Sheets, with a focus on utility and scannability.

## User Preferences

Preferred communication style: Simple, everyday language.

## Brand Customization

**ValuCompass Branding:**
- Primary Color: #1F406F (deep blue - used for buttons, links, accents)
- Primary Font: Montserrat (headings and body text)
- Secondary Font: Lato (available for secondary content)
- Logo: Sourced from https://discovervalucompass.github.io/experts/assets/images/vc_experts_logo.png

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) v5 for server state management
- **UI Components**: shadcn/ui component library (New York style variant)
- **Styling**: Tailwind CSS with custom design tokens and Material Design-inspired approach
- **Build Tool**: Vite for fast development and optimized production builds

**Design System**:
- Card-based layout optimized for information density
- Responsive grid system (1 column mobile, 2 columns tablet, 3 columns desktop)
- Category filters displayed in side-by-side sections (Growth/Protection) on desktop, stacked on mobile
- Montserrat font family for primary typography (headings and body text)
- Lato font family available for secondary content
- Custom color system using HSL with CSS variables for theming support
- Spacing based on Tailwind's 2/4/6/8 unit system
- Content block system with 7 widget types for rich content composition

### Backend Architecture

**Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled to ESM modules
- **API Pattern**: RESTful endpoints serving JSON
- **Data Validation**: Zod schemas for runtime type checking
- **Build Process**: esbuild for production bundling

**Server Structure**:
- Express middleware for JSON parsing and request logging
- Custom Vite integration for development with HMR
- Modular route registration pattern
- In-memory caching layer for performance optimization

### Data Storage Solutions

**Primary Data Source**: Google Sheets integration
- Real-time data fetching via Google Sheets API v4
- OAuth2 authentication using Replit Connectors
- 5-minute cache duration to balance freshness with API quota

**Caching Strategy**:
- In-memory storage implementation (`MemStorage` class)
- Automatic cache refresh on 5-minute intervals
- Fallback to cached data if Google Sheets API fails

**Expert Data Schema** (Sheet1!A:E):
```typescript
{
  firstName: string
  lastName: string
  email: string (validated)
  category: string
  group: string (Growth/Protection grouping)
}
```

**Content Management System**: Google Sheets-based block/widget system (Content!A:F)
- **Content Schema**:
```typescript
{
  title: string
  content: string
  order: number (controls display sequence)
  type: string (widget type: text, image, hero, two-column, cards, image-text)
  imageUrl: string (optional, for visual widgets)
  secondaryContent: string (optional, for two-column layout)
}
```

**Supported Widget Types**:
1. **text**: Standard text content with optional title
2. **image**: Full-width image with caption (title used as caption)
3. **hero**: Large banner image (h-96) with overlaid title and content (dark gradient background)
4. **two-column**: Side-by-side layout with content + secondaryContent (responsive, stacks on mobile)
5. **cards**: Grid layout (3 cols desktop, 2 tablet, 1 mobile) - content split by double line breaks
6. **image-text**: Image alongside text content in 2-column layout

Content sections appear below expert listings, separated by divider, with 5-minute cache refresh.

### Authentication and Authorization

Currently implements read-only access with no user authentication. Authorization is handled at the infrastructure level through:
- Replit's identity tokens (REPL_IDENTITY for development, WEB_REPL_RENEWAL for deployment)
- Google Sheets OAuth credentials managed via Replit Connectors
- Connection settings cached to minimize auth overhead

### External Dependencies

**Third-Party Services**:
1. **Google Sheets API**: Primary data source
   - Spreadsheet ID: `1kRomUELKC_iLfW5OQFG-78mc8r8jQ1qujDhINhdygEg`
   - Sheet1!A:E: Expert directory data
   - Content!A:F: Content management blocks/widgets
   - Requires OAuth2 credentials via Replit Connectors
   - Rate-limited through 5-minute caching strategy for both datasets

2. **Replit Platform Services**:
   - Connector API for Google Sheets authentication
   - Development tooling (cartographer, dev banner, error overlay)
   - Identity/renewal tokens for secure API access

**UI Component Library**:
- Radix UI primitives (20+ components) for accessible, unstyled components
- Lucide React for iconography
- Embla Carousel for potential carousel functionality
- CMDK for command palette patterns

**Styling & Utilities**:
- Tailwind CSS v3 with PostCSS
- class-variance-authority for component variant management
- clsx & tailwind-merge for conditional class handling
- date-fns for date manipulation

**Developer Experience**:
- TypeScript for type safety across frontend/backend
- Drizzle ORM configured (PostgreSQL dialect) - note: database not currently in use but configured for future extension
- ESBuild for fast production builds
- TSX for TypeScript execution in development