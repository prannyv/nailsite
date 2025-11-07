# PolishedByLauren - Nail Appointment Calendar

A beautiful, pink-themed appointment booking and press-on inventory management system for nail services.

## Features

- 📅 **Interactive Calendar**: Monthly calendar view with appointment markers
- 💅 **Appointment Management**: Create, edit, and track nail appointments with pricing calculations
- 💎 **Press-On Inventory**: Manage press-on nail sets with photos and availability status
- 💰 **Automatic Pricing**: Smart price calculation based on services and add-ons
- 💾 **Local Storage**: All data persists in browser localStorage
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Beautiful UI**: Pink, silver, and white themed design with smooth animations

## Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── calendar/          # Calendar components
│   ├── appointments/      # Appointment management
│   ├── pressons/          # Press-on inventory
│   └── shared/            # Reusable UI components
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions and constants
├── store/                 # Zustand state management
├── App.tsx               # Main application component
└── index.css             # Global styles with Tailwind
```

## Service Pricing

### Base Services
- **Gel X**: $50 (Short/Medium), $60 (Long/XLong)
- **Gel Manicure**: $40
- **Builder Gel**: $50

### Add-ons (per nail)
- French Tip: $1/nail
- Simple Design: $1/nail
- Complex Design: $2/nail
- 3D Gel: $2/nail
- Charms: $2/nail

## Features in Detail

### Calendar
- View appointments by month
- Visual indicators for days with appointments
- Click any day to view or add appointments
- Navigate between months

### Appointments
- Add appointments with client name, service type, and add-ons
- Upload inspiration photos
- Add inspiration notes
- Automatic price calculation
- Edit or delete existing appointments
- View upcoming appointments for the week
- Expand/collapse appointment details

### Press-Ons
- Manage press-on inventory
- Upload multiple photos per set
- Track size, quantity, and status
- Filter by availability status (Available, Reserved, Sold)
- Edit or delete press-on entries

## Future Enhancements (Backend)

The implementation plan includes future backend integration:
- User authentication
- Cloud database (PostgreSQL/MongoDB)
- Image hosting (Cloudinary/S3)
- API endpoints for data management
- Email notifications for appointments
- Calendar sync with Google Calendar

## Color Palette

- **Primary Pink**: #FFB6C1 (light pink), #FF69B4 (hot pink)
- **Silver**: #C0C0C0, #E8E8E8
- **White**: #FFFFFF, #FAFAFA
- **Accent**: #FFD1DC (baby pink)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved

---

**Made with 💖 for PolishedByLauren**
