# Expert Directory Design Guidelines

## Design Approach
**Selected Approach:** Design System - Material Design inspired with modern card-based interface
**Justification:** This is a utility-focused, information-dense directory that prioritizes searchability and scannability. Users need to quickly find and contact experts across categories.

## Core Design Elements

### Typography
- **Headings:** Inter font family
  - Page Title (h1): text-4xl, font-bold
  - Section Headers (h2): text-2xl, font-semibold
  - Category Labels: text-lg, font-medium
  - Expert Names: text-lg, font-semibold
- **Body Text:** Inter font family
  - Search placeholder/labels: text-sm, font-normal
  - Email addresses: text-sm, font-normal
  - Filter badges: text-xs, font-medium, uppercase tracking-wide

### Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 for consistency
- Container padding: px-4 md:px-8
- Section spacing: py-8 md:py-12
- Card padding: p-6
- Grid gaps: gap-4 md:gap-6
- Element margins: mb-2, mb-4, mb-6, mb-8

**Grid Structure:**
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3 columns (lg:grid-cols-3)
- Max container width: max-w-7xl mx-auto

### Component Library

#### 1. Header Section
- Full-width header with centered content
- Page title prominently displayed
- Subtitle explaining the directory purpose
- Padding: py-12 md:py-16

#### 2. Search & Filter Bar
- Sticky positioning at top after scroll (sticky top-0)
- Search input with icon (magnifying glass from Heroicons)
- Category filter dropdown or chip-based multi-select
- "Clear filters" button when filters active
- Input height: h-12
- Rounded corners: rounded-lg
- Border treatment: border-2

#### 3. Expert Cards
**Card Structure:**
- Rounded corners: rounded-xl
- Shadow: shadow-md with hover:shadow-lg transition
- Padding: p-6
- Border: border

**Card Content Layout:**
- Expert name at top (text-lg font-semibold)
- Category badge below name (inline-flex items-center gap-2)
- Email address at bottom with mail icon
- Vertical spacing between elements: space-y-4

**Category Badge:**
- Rounded: rounded-full
- Padding: px-3 py-1
- Text: text-xs font-medium uppercase tracking-wide
- Inline with icon from Heroicons

#### 4. Empty States
- Centered message when no results found
- Icon illustration (search with X or empty folder)
- Helpful text: "No experts found. Try adjusting your filters."
- Padding: py-16

#### 5. Loading State
- Skeleton cards matching expert card dimensions
- Pulse animation (animate-pulse)
- Display 6-9 skeleton cards in grid

#### 6. Category Filter Section
- Horizontal scrollable chip list on mobile
- Wrapped grid on desktop
- Active state: filled style with checkmark
- Inactive state: outlined style
- Spacing: gap-2

### Interaction Patterns

**Search Behavior:**
- Live/debounced search (300ms delay)
- Search across name and email fields
- Clear button appears when text entered

**Filter Behavior:**
- Click category chip to toggle
- Multiple categories can be selected (OR logic)
- "All Categories" chip to reset
- Filter count badge showing active filters

**Card Interactions:**
- Hover effect: lift with shadow increase
- Email click: opens default mail client (mailto:)
- Smooth transitions: transition-all duration-200

### Page Layout Structure

1. **Hero/Header Section** (py-12 md:py-16)
   - Centered title and description
   - No background image needed - clean, focused

2. **Search Controls Section** (sticky top-0, py-6)
   - Search input (flex-grow)
   - Category filters
   - Results count display

3. **Expert Grid Section** (py-8)
   - Responsive grid of expert cards
   - Minimum height to prevent layout shift

4. **Footer** (py-8, text-center)
   - Powered by note
   - Last updated timestamp from Google Sheets

### Responsive Behavior
- Mobile (< 768px): Single column, simplified filters
- Tablet (768px - 1024px): 2 columns, horizontal filter scroll
- Desktop (> 1024px): 3 columns, all filters visible

### Accessibility
- Search input: aria-label="Search experts by name or email"
- Filter buttons: aria-pressed states
- Cards: Proper heading hierarchy
- Email links: aria-label with expert name
- Focus indicators: ring-2 ring-offset-2

### Performance Considerations
- Virtual scrolling if expert count exceeds 100
- Lazy load cards below fold
- Debounced search input
- Memoize filtered results

## Images
**No hero image required** - This is a functional directory focused on quick access to expert information. The clean, card-based layout provides visual interest through organized structure rather than imagery.