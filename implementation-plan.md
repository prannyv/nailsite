# PolishedByLauren - Nail Appointment Calendar
## Implementation Plan

---

## Project Overview

A pink, silver, and white themed appointment booking system for nail services with calendar visualization, appointment management, and press-on inventory tracking.

**Tech Stack:**
- **Framework:** Next.js 14+ (App Router) with React 18+
- **Build Tool:** Vite (for fast development) or Next.js built-in tooling
- **Styling:** Tailwind CSS
- **Type Safety:** TypeScript (recommended)
- **State Management:** React Context API or Zustand (lightweight)

**Color Palette:**
- Primary Pink: `#FFB6C1` (light pink), `#FF69B4` (hot pink)
- Silver: `#C0C0C0`, `#E8E8E8`
- White: `#FFFFFF`, `#FAFAFA` (off-white for backgrounds)
- Accent: `#FFD1DC` (baby pink)

---

## Architecture Overview

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page (main calendar view)
│   ├── layout.tsx           # Root layout with global styles
│   └── globals.css          # Tailwind imports and custom styles
├── components/
│   ├── calendar/
│   │   ├── Calendar.tsx           # Main calendar component
│   │   ├── CalendarDay.tsx        # Individual day cell
│   │   └── CalendarHeader.tsx     # Month/Year navigation
│   ├── appointments/
│   │   ├── AppointmentList.tsx        # Left sidebar list
│   │   ├── AppointmentCard.tsx        # Collapsed appointment view
│   │   ├── AppointmentDetails.tsx     # Expanded appointment view
│   │   └── AddAppointmentModal.tsx    # New appointment form
│   ├── pressons/
│   │   ├── PressOnList.tsx        # Press-ons inventory list
│   │   ├── PressOnCard.tsx        # Individual press-on item
│   │   └── AddPressOnModal.tsx    # New press-on form
│   ├── shared/
│   │   ├── Button.tsx             # Reusable button component
│   │   ├── Modal.tsx              # Reusable modal wrapper
│   │   └── AddNewMenu.tsx         # "Add New" dropdown menu
│   └── ui/                        # Shadcn/ui components (optional)
├── types/
│   ├── appointment.ts         # Appointment type definitions
│   └── presson.ts            # Press-on type definitions
├── utils/
│   ├── dateHelpers.ts        # Date manipulation utilities
│   ├── priceCalculator.ts    # Pricing logic based on services
│   └── constants.ts          # Service types, pricing, etc.
├── hooks/
│   ├── useAppointments.ts    # Appointment CRUD operations
│   └── usePressOns.ts        # Press-on CRUD operations
└── context/
    └── AppContext.tsx        # Global state management
```

---

## Data Models

### Appointment Type
```typescript
interface Appointment {
  id: string;
  date: Date;
  clientName?: string;
  serviceType: 'GEL_X' | 'GEL_MANICURE' | 'BUILDER_GEL';
  nailLength: 'SHORT_MEDIUM' | 'LONG_XLONG';
  addOns: AddOn[];
  inspirationPhotos: string[];  // URLs or base64
  inspirationText: string;
  estimatedPrice: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

interface AddOn {
  type: 'FRENCH_TIP' | 'SIMPLE_DESIGN' | 'COMPLEX_DESIGN' | '3D_GEL' | 'CHARMS';
  quantity: number;  // Number of nails (default 10)
  pricePerNail: number;
  totalPrice: number;
}
```

### Press-On Type
```typescript
interface PressOn {
  id: string;
  name: string;
  description?: string;
  photos: string[];  // URLs or base64
  size: string;  // e.g., "XS", "S", "M", "L"
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  createdAt: Date;
  updatedAt: Date;
}
```

### Pricing Constants
```typescript
const PRICING = {
  GEL_X: {
    SHORT_MEDIUM: 50,
    LONG_XLONG: 60,
  },
  GEL_MANICURE: 40,
  BUILDER_GEL: 50,
  ADD_ONS: {
    FRENCH_TIP: 1,
    SIMPLE_DESIGN: 1,
    COMPLEX_DESIGN: 2,
    '3D_GEL': 2,
    CHARMS: 2,
  },
};
```

---

## Component Specifications

### 1. Home Page Layout (`app/page.tsx`)

**Layout Structure:**
- Two-column grid layout (responsive)
- Left sidebar: ~35% width (appointments & press-ons)
- Right main area: ~65% width (calendar)
- Fixed "Add New" button (bottom-right or top-right)

**Responsive Behavior:**
- Desktop: Side-by-side columns
- Tablet/Mobile: Stack vertically (sidebar on top)

---

### 2. Calendar Component (`components/calendar/Calendar.tsx`)

**Features:**
- Display current month in grid format (7 columns for days of week)
- Month/Year navigation (prev/next arrows)
- Visual markers on days with appointments (pink dot or badge)
- Click day to view appointments for that date
- Click empty day to quick-add appointment for that date

**Styling:**
- Rounded corners on day cells
- Hover effects (subtle pink highlight)
- Current day highlighted with border
- Days with appointments: pink badge with count

**State:**
- Current selected month/year
- Appointments data (filtered by month)

---

### 3. Appointment List (`components/appointments/AppointmentList.tsx`)

**Features:**
- Display appointments for the upcoming week at the top
- "Show All Appointments" dropdown to reveal past/future appointments
- Each appointment shown as a card (collapsed by default)
- Click to expand and show full details inline

**Sections:**
- "Upcoming This Week" (next 7 days)
- "All Appointments" (collapsible dropdown)

**Sorting:**
- Chronological order (soonest first)

---

### 4. Appointment Card (`components/appointments/AppointmentCard.tsx`)

**Collapsed View:**
- Date and time
- Client name (if provided)
- Service type icon/badge
- Estimated price
- Expand/collapse arrow

**Expanded View (inline):**
- All collapsed info +
- Nail length
- Add-ons list with individual prices
- Inspiration photos (gallery)
- Inspiration text
- Edit/Delete buttons

**Styling:**
- Rounded cards with soft shadow
- Pink accent for active/selected state
- Smooth expand/collapse animation

---

### 5. Add Appointment Modal (`components/appointments/AddAppointmentModal.tsx`)

**Form Fields:**
1. Date picker (pre-filled if clicked from calendar)
2. Client name (optional text input)
3. Service type dropdown (Gel X, Gel Manicure, Builder Gel)
4. Nail length radio buttons (if Gel X selected)
5. Add-ons checklist with quantity inputs
   - Each add-on shows: name, quantity selector (1-10), calculated price
6. Inspiration photo upload (multiple files)
7. Inspiration text (textarea)
8. Estimated price display (auto-calculated, read-only)

**Price Calculator Logic:**
- Base service price (based on type + length if applicable)
- Add-ons: `price_per_nail * quantity * number_of_add_ons`
- Display breakdown and total

**Validation:**
- Date is required
- Service type is required
- At least one add-on OR base service selected

**Actions:**
- Save appointment
- Cancel (close modal)

---

### 6. Press-On Components

**PressOnList.tsx:**
- Display press-ons in a grid or list
- Show thumbnail, name, status badge
- Click to view details (could be modal or inline expand)

**AddPressOnModal.tsx:**
- Name input
- Description textarea
- Photo upload (multiple)
- Size input
- Quantity number input
- Status dropdown (Available, Reserved, Sold)

**Display Location:**
- Below "Upcoming This Week" appointments in left sidebar
- Section header: "Press-Ons Inventory"

---

### 7. Add New Menu (`components/shared/AddNewMenu.tsx`)

**Trigger:**
- Floating action button (FAB) or top-right button
- Pink circular button with "+" icon

**Menu Options:**
- "New Appointment" → Opens AddAppointmentModal
- "New Press-On" → Opens AddPressOnModal

**Styling:**
- Dropdown menu with rounded corners
- Pink hover states
- Smooth open/close animation

---

## State Management Strategy

### Option 1: React Context (Simpler)
```typescript
// context/AppContext.tsx
interface AppState {
  appointments: Appointment[];
  pressOns: PressOn[];
  selectedDate: Date | null;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addPressOn: (pressOn: PressOn) => void;
  updatePressOn: (id: string, updates: Partial<PressOn>) => void;
  deletePressOn: (id: string) => void;
}
```

### Option 2: Zustand (Recommended for scalability)
```typescript
// store/useStore.ts
const useStore = create<AppState>((set) => ({
  appointments: [],
  pressOns: [],
  addAppointment: (appointment) => 
    set((state) => ({ 
      appointments: [...state.appointments, appointment] 
    })),
  // ... other actions
}));
```

**Initial Data Storage:**
- **Phase 1 (MVP):** LocalStorage (persist appointments/press-ons)
- **Phase 2 (Backend):** API integration (to be implemented in Cursor)

---

## Utility Functions

### Date Helpers (`utils/dateHelpers.ts`)
```typescript
// Get all days in a month for calendar grid
const getDaysInMonth(date: Date): Date[]

// Check if date has appointments
const hasAppointments(date: Date, appointments: Appointment[]): boolean

// Get appointments for a specific date
const getAppointmentsForDate(date: Date, appointments: Appointment[]): Appointment[]

// Get appointments for next 7 days
const getUpcomingWeekAppointments(appointments: Appointment[]): Appointment[]

// Format date for display
const formatDate(date: Date): string
```

### Price Calculator (`utils/priceCalculator.ts`)
```typescript
// Calculate total appointment price
const calculateAppointmentPrice(appointment: Partial<Appointment>): number {
  let total = 0;
  
  // Base service price
  if (appointment.serviceType === 'GEL_X') {
    total += PRICING.GEL_X[appointment.nailLength];
  } else if (appointment.serviceType === 'GEL_MANICURE') {
    total += PRICING.GEL_MANICURE;
  } else if (appointment.serviceType === 'BUILDER_GEL') {
    total += PRICING.BUILDER_GEL;
  }
  
  // Add-ons (multiply by 10 for per-nail items)
  appointment.addOns?.forEach(addOn => {
    total += addOn.pricePerNail * addOn.quantity;
  });
  
  return total;
}

// Calculate add-on price
const calculateAddOnPrice(type: string, quantity: number): number
```

---

## Styling Guidelines

### Tailwind Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'pink-light': '#FFB6C1',
        'pink-hot': '#FF69B4',
        'pink-baby': '#FFD1DC',
        'silver': '#C0C0C0',
        'silver-light': '#E8E8E8',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Design Tokens
- **Border Radius:** `rounded-xl` (1rem) for cards, `rounded-full` for buttons
- **Shadows:** `shadow-md` for cards, `shadow-lg` for modals
- **Spacing:** Consistent padding (`p-4`, `p-6`) and gaps (`gap-4`)
- **Fonts:** Simple sans-serif (Inter, Poppins, or default system fonts)
- **Font Weights:** Regular (400) for body, Medium (500) for labels, Semibold (600) for headings

### Component Styling Patterns
```tsx
// Button
className="bg-pink-hot text-white px-6 py-3 rounded-full hover:bg-pink-light transition-colors"

// Card
className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"

// Input
className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"

// Modal Backdrop
className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
```

---

## Development Phases

### Phase 1: Foundation (Week 1)
1. **Setup project:**
   - Initialize Next.js with TypeScript
   - Configure Tailwind CSS
   - Setup project structure (folders, files)

2. **Core components:**
   - Create layout structure (two-column grid)
   - Build Calendar component with month navigation
   - Implement CalendarDay cells with hover states

3. **State management:**
   - Setup Context/Zustand store
   - Implement localStorage persistence
   - Create mock data for testing

### Phase 2: Appointments (Week 2)
1. **Appointment display:**
   - Build AppointmentList component
   - Create AppointmentCard (collapsed/expanded views)
   - Implement expand/collapse animations

2. **Add appointment:**
   - Build AddAppointmentModal with form
   - Implement price calculator
   - Add form validation
   - Connect to state management

3. **Calendar integration:**
   - Show appointment markers on calendar
   - Click day to view/add appointments
   - Display appointment count badges

### Phase 3: Press-Ons & Polish (Week 3)
1. **Press-ons feature:**
   - Build PressOnList and PressOnCard
   - Create AddPressOnModal
   - Integrate with state management

2. **Add New menu:**
   - Build floating action button
   - Create dropdown menu
   - Connect to modals

3. **Refinement:**
   - Responsive design adjustments
   - Accessibility improvements (ARIA labels, keyboard navigation)
   - Loading states and error handling
   - Polish animations and transitions

### Phase 4: Backend Integration (Future - Cursor)
**To be implemented later:**
- Setup backend API (Node.js/Express, or Next.js API routes)
- Database integration (PostgreSQL, MongoDB, or Supabase)
- Authentication (if needed for multi-user)
- Image upload service (Cloudinary, AWS S3)
- Real-time updates (optional: WebSockets or Pusher)

**API Endpoints to implement:**
```
GET    /api/appointments          # Get all appointments
POST   /api/appointments          # Create appointment
PUT    /api/appointments/:id      # Update appointment
DELETE /api/appointments/:id      # Delete appointment

GET    /api/press-ons             # Get all press-ons
POST   /api/press-ons             # Create press-on
PUT    /api/press-ons/:id         # Update press-on
DELETE /api/press-ons/:id         # Delete press-on

POST   /api/upload                # Image upload endpoint
```

---

## Key Technical Decisions

### Why Next.js over Vite?
- Next.js provides server-side rendering (useful for future backend integration)
- Built-in API routes (can add backend later without separate server)
- Better for production deployment
- File-based routing

*Alternative:* Vite + React Router if you prefer pure client-side SPA

### LocalStorage vs Backend (Phase 1)
- Start with localStorage for MVP (no setup required)
- Easy to migrate to backend later
- Good for prototyping and testing UI/UX

### State Management Choice
- **Zustand recommended** - minimal boilerplate, easy to use
- React Context works too for simpler apps
- Avoid Redux for this project (overkill)

---

## Testing Strategy (Optional but Recommended)

### Unit Tests
- Price calculator functions
- Date helper utilities
- Form validation logic

### Component Tests
- Calendar rendering and navigation
- Appointment card expand/collapse
- Form submissions

### Tools
- Vitest (fast, Vite-native)
- React Testing Library
- Playwright/Cypress for E2E (later phases)

---

## Deployment Considerations

### Frontend Hosting Options
- **Vercel** (recommended for Next.js, free tier)
- **Netlify** (great for static sites)
- **AWS Amplify** (if you plan AWS backend)

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://polishedbylaurennn.com
# Future backend variables:
# NEXT_PUBLIC_API_URL=
# CLOUDINARY_API_KEY=
```

---

## Open Questions / Decisions for Later

1. **Authentication:**
   - Is this a single-user app (just you) or multi-user?
   - If multi-user: Auth0, Clerk, or custom auth?

2. **Image Storage:**
   - Cloudinary (easy, generous free tier)
   - AWS S3 (scalable, more setup)
   - Supabase Storage (good if using Supabase for DB)

3. **Database Choice:**
   - **PostgreSQL** (Supabase, Railway) - structured data, good for relational
   - **MongoDB** (MongoDB Atlas) - flexible schemas
   - **Firebase** (quick setup, real-time)

4. **Email Notifications:**
   - SendGrid, Mailgun, or Resend for appointment reminders?

5. **Calendar Sync:**
   - Integrate with Google Calendar for appointments?

---

## Getting Started Command

```bash
# Create Next.js project
npx create-next-app@latest polished-by-lauren --typescript --tailwind --app

# Or with Vite
npm create vite@latest polished-by-lauren -- --template react-ts
cd polished-by-lauren
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install dependencies
npm install zustand date-fns # state management and date utilities
npm install lucide-react # icon library (optional)
npm install @headlessui/react # unstyled accessible components (optional)

# Run dev server
npm run dev
```

---

## Next Steps

1. Review this plan and confirm technical choices
2. Set up the project with chosen stack
3. Start with Phase 1 (Foundation)
4. Build iteratively, test frequently
5. Revisit backend architecture when ready for Phase 4

**Backend discussion points for future:**
- User authentication requirements
- Image hosting preferences
- Database schema design
- API structure and endpoints
- Deployment infrastructure

---

## Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/) - for complex forms
- [Shadcn/ui](https://ui.shadcn.com/) - prebuilt Tailwind components

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Author:** Implementation plan for PolishedByLauren appointment system
