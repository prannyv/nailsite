export const PRICING = {
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

export const SERVICE_TYPES = [
  { value: 'GEL_X', label: 'Gel X' },
  { value: 'GEL_MANICURE', label: 'Gel Manicure' },
  { value: 'BUILDER_GEL', label: 'Builder Gel' },
] as const;

export const NAIL_LENGTHS = [
  { value: 'SHORT_MEDIUM', label: 'Short/Medium' },
  { value: 'LONG_XLONG', label: 'Long/XLong' },
] as const;

export const ADD_ON_TYPES = [
  { value: 'FRENCH_TIP', label: 'French Tip' },
  { value: 'SIMPLE_DESIGN', label: 'Simple Design' },
  { value: 'COMPLEX_DESIGN', label: 'Complex Design' },
  { value: '3D_GEL', label: '3D Gel' },
  { value: 'CHARMS', label: 'Charms' },
] as const;

export const PRESS_ON_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
] as const;

// Google Calendar sync configuration
export const CALENDAR_SYNC_CONFIG = {
  // Number of months to look back when syncing from Google Calendar
  MONTHS_BEFORE: 3,
  // Number of months to look forward when syncing from Google Calendar
  MONTHS_AFTER: 3,
  // Main folder name in Google Drive for all appointment data
  DRIVE_FOLDER_NAME: 'Nailsite Appointments',
};

