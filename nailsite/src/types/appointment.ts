export interface Appointment {
  id: string;
  date: Date;
  clientName?: string;
  serviceType: 'GEL_X' | 'GEL_MANICURE' | 'BUILDER_GEL';
  nailLength: 'SHORT_MEDIUM' | 'LONG_XLONG';
  inspirationPhotos: string[];  // URLs or base64
  inspirationText: string;
  price: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  googleCalendarEventId?: string;  // Google Calendar event ID for sync
  createdAt: Date;
  updatedAt: Date;
}

