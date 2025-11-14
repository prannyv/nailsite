import type { Appointment } from '../types/appointment';
import { CALENDAR_SYNC_CONFIG } from '../utils/constants';

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APP_URL = import.meta.env.VITE_APP_URL || 'https://polishedbylauren.vercel.app';

// Storage keys
const TOKENS_KEY = 'google_calendar_tokens';
const DRIVE_FOLDER_ID_KEY = 'google_drive_main_folder_id';

export const GoogleCalendarService = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens?.access_token && !!tokens?.refresh_token;
  },

  // Get stored tokens
  getTokens(): GoogleTokens | null {
    const stored = localStorage.getItem(TOKENS_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Store tokens
  setTokens(tokens: GoogleTokens): void {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },

  // Clear tokens (logout)
  clearTokens(): void {
    localStorage.removeItem(TOKENS_KEY);
    localStorage.removeItem(DRIVE_FOLDER_ID_KEY);
  },

  // Initiate OAuth flow
  startOAuthFlow(): void {
    // Validate that CLIENT_ID is available
    if (!CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
      alert('Error: Google Client ID is not configured. Please check your environment variables.');
      return;
    }

    if (!APP_URL) {
      console.error('VITE_APP_URL is not set in environment variables');
      alert('Error: App URL is not configured. Please check your environment variables.');
      return;
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/drive.file', // Access to files created by the app
    ].join(' ');

    const redirectUri = `${APP_URL}/api/auth/callback`;
    
    // Log for debugging (remove in production)
    console.log('OAuth Flow Debug:', {
      clientId: CLIENT_ID,
      redirectUri,
      appUrl: APP_URL,
    });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  },

  // Refresh access token if expired
  async refreshAccessToken(): Promise<string> {
    const tokens = this.getTokens();
    if (!tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${APP_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refresh_token }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const newTokens = await response.json();
    this.setTokens({
      ...tokens,
      access_token: newTokens.access_token,
      expiry_date: newTokens.expiry_date,
    });

    return newTokens.access_token;
  },

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string> {
    const tokens = this.getTokens();
    if (!tokens?.access_token) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = Date.now();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes
    if (tokens.expiry_date && tokens.expiry_date - expiryBuffer < now) {
      return await this.refreshAccessToken();
    }

    return tokens.access_token;
  },

  // ===== GOOGLE DRIVE INTEGRATION =====

  // Get or create the main Nailsite folder in Google Drive
  async getOrCreateMainFolder(): Promise<string> {
    // Check if we already have the folder ID stored
    const storedFolderId = localStorage.getItem(DRIVE_FOLDER_ID_KEY);
    if (storedFolderId) {
      return storedFolderId;
    }

    const accessToken = await this.getValidAccessToken();

    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${CALENDAR_SYNC_CONFIG.DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.files && searchData.files.length > 0) {
        const folderId = searchData.files[0].id;
        localStorage.setItem(DRIVE_FOLDER_ID_KEY, folderId);
        return folderId;
      }
    }

    // Create new folder if not found
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: CALENDAR_SYNC_CONFIG.DRIVE_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create main folder in Google Drive');
    }

    const createData = await createResponse.json();
    localStorage.setItem(DRIVE_FOLDER_ID_KEY, createData.id);
    return createData.id;
  },

  // Create appointment-specific subfolder
  async createAppointmentFolder(
    appointmentDate: Date,
    clientName: string
  ): Promise<string> {
    const mainFolderId = await this.getOrCreateMainFolder();
    const accessToken = await this.getValidAccessToken();

    // Format folder name: "2025-01-15 - Jane Doe"
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const folderName = `${dateStr} - ${clientName || 'No Name'}`;

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [mainFolderId],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create appointment folder');
    }

    const data = await response.json();
    return data.id;
  },

  // Upload image to Google Drive
  async uploadImageToDrive(
    imageData: string,
    fileName: string,
    folderId: string
  ): Promise<string> {
    const accessToken = await this.getValidAccessToken();

    // Convert base64 to blob if needed
    let blob: Blob;
    if (imageData.startsWith('data:')) {
      // It's a base64 data URL
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      const binaryData = atob(base64Data);
      const arrayBuffer = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }
      blob = new Blob([arrayBuffer], { type: mimeType });
    } else {
      // Assume it's already a URL - fetch it
      const response = await fetch(imageData);
      blob = await response.blob();
    }

    // Create metadata
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    // Use multipart upload
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Drive');
    }

    const data = await response.json();
    return data.id;
  },

  // Download image from Google Drive as base64
  async downloadImageFromDrive(fileId: string): Promise<string> {
    const accessToken = await this.getValidAccessToken();

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download image from Drive');
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // ===== CALENDAR EVENT MANAGEMENT =====

  // Create calendar event from appointment
  async createEvent(appointment: Appointment): Promise<string> {
    const accessToken = await this.getValidAccessToken();
    
    // Upload images to Drive if there are any
    let imageFileIds: string[] = [];
    let appointmentFolderId: string | undefined;

    if (appointment.inspirationPhotos && appointment.inspirationPhotos.length > 0) {
      try {
        // Create appointment folder
        appointmentFolderId = await this.createAppointmentFolder(
          appointment.date,
          appointment.clientName || 'No Name'
        );

        // Upload each image
        const uploadPromises = appointment.inspirationPhotos.map(async (photo, index) => {
          const fileName = `inspiration-${index + 1}.jpg`;
          return await this.uploadImageToDrive(photo, fileName, appointmentFolderId!);
        });

        imageFileIds = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error uploading images to Drive:', error);
        // Continue without images rather than failing completely
      }
    }

    // Prepare extended properties with all appointment data
    const extendedProperties: Record<string, string> = {
      serviceType: appointment.serviceType,
      nailLength: appointment.nailLength,
      estimatedPrice: appointment.estimatedPrice.toString(),
      status: appointment.status,
      inspirationText: appointment.inspirationText || '',
    };

    // Add image file IDs if any
    if (imageFileIds.length > 0) {
      extendedProperties.imageFileIds = imageFileIds.join(',');
      extendedProperties.driveFolderId = appointmentFolderId!;
    }

    // Add add-ons data if any
    if (appointment.addOns && appointment.addOns.length > 0) {
      extendedProperties.addOns = JSON.stringify(appointment.addOns);
    }
    
    const event = {
      summary: `${appointment.clientName || 'Nail Appointment'} - ${appointment.serviceType.replace(/_/g, ' ')}`,
      description: `Service: ${appointment.serviceType.replace(/_/g, ' ')}\nNail Length: ${appointment.nailLength.replace(/_/g, ' ')}\nPrice: $${appointment.estimatedPrice}\n\nInspiration: ${appointment.inspirationText || 'None'}`,
      start: {
        dateTime: new Date(appointment.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(appointment.date).getTime() + 90 * 60000).toISOString(), // 1.5 hours default
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '4', // Pink color in Google Calendar
      extendedProperties: {
        private: extendedProperties,
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create calendar event');
    }

    const data = await response.json();
    return data.id; // Return Google Calendar event ID
  },

  // Update calendar event
  async updateEvent(eventId: string, appointment: Appointment): Promise<void> {
    const accessToken = await this.getValidAccessToken();
    
    // Handle image updates if needed
    let imageFileIds: string[] = [];
    let appointmentFolderId: string | undefined;

    if (appointment.inspirationPhotos && appointment.inspirationPhotos.length > 0) {
      try {
        // Check if folder already exists, create if not
        appointmentFolderId = await this.createAppointmentFolder(
          appointment.date,
          appointment.clientName || 'No Name'
        );

        // Upload new images (in a real app, you might want to diff and only upload new ones)
        const uploadPromises = appointment.inspirationPhotos.map(async (photo, index) => {
          // Skip if it's already a Drive file ID (starts with a specific pattern)
          if (!photo.startsWith('data:') && !photo.startsWith('http')) {
            return photo; // Already a file ID
          }
          const fileName = `inspiration-${index + 1}.jpg`;
          return await this.uploadImageToDrive(photo, fileName, appointmentFolderId!);
        });

        imageFileIds = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error uploading images to Drive:', error);
      }
    }

    // Prepare extended properties
    const extendedProperties: Record<string, string> = {
      serviceType: appointment.serviceType,
      nailLength: appointment.nailLength,
      estimatedPrice: appointment.estimatedPrice.toString(),
      status: appointment.status,
      inspirationText: appointment.inspirationText || '',
    };

    if (imageFileIds.length > 0) {
      extendedProperties.imageFileIds = imageFileIds.join(',');
      extendedProperties.driveFolderId = appointmentFolderId!;
    }

    if (appointment.addOns && appointment.addOns.length > 0) {
      extendedProperties.addOns = JSON.stringify(appointment.addOns);
    }
    
    const event = {
      summary: `${appointment.clientName || 'Nail Appointment'} - ${appointment.serviceType.replace(/_/g, ' ')}`,
      description: `Service: ${appointment.serviceType.replace(/_/g, ' ')}\nNail Length: ${appointment.nailLength.replace(/_/g, ' ')}\nPrice: $${appointment.estimatedPrice}\n\nInspiration: ${appointment.inspirationText || 'None'}`,
      start: {
        dateTime: new Date(appointment.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(appointment.date).getTime() + 90 * 60000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '4',
      extendedProperties: {
        private: extendedProperties,
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update calendar event');
    }
  },

  // Delete calendar event
  async deleteEvent(eventId: string): Promise<void> {
    const accessToken = await this.getValidAccessToken();
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete calendar event');
    }
  },

  // ===== SYNC FROM GOOGLE CALENDAR =====

  // Sync appointments from Google Calendar
  async syncFromCalendar(): Promise<Appointment[]> {
    const accessToken = await this.getValidAccessToken();

    // Calculate time range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - CALENDAR_SYNC_CONFIG.MONTHS_BEFORE);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + CALENDAR_SYNC_CONFIG.MONTHS_AFTER);
    endDate.setHours(23, 59, 59, 999);

    // Fetch events from Google Calendar
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?` +
      `timeMin=${startDate.toISOString()}&` +
      `timeMax=${endDate.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    const events: CalendarEvent[] = data.items || [];

    // Filter and parse events that contain "gel" in the title
    const appointments: Appointment[] = [];

    for (const event of events) {
      // Check if event summary contains "gel" (case-insensitive)
      if (!event.summary || !event.summary.toLowerCase().includes('gel')) {
        continue;
      }

      try {
        const appointment = await this.parseEventToAppointment(event);
        if (appointment) {
          appointments.push(appointment);
        }
      } catch (error) {
        console.error('Error parsing event:', event.id, error);
        // Continue with other events
      }
    }

    return appointments;
  },

  // Parse a calendar event into an Appointment object
  async parseEventToAppointment(event: CalendarEvent): Promise<Appointment | null> {
    // Parse the summary: "Name - Service Type"
    const summaryParts = event.summary.split(' - ');
    const clientName = summaryParts[0]?.trim() || 'Unknown';
    const serviceText = summaryParts[1]?.trim().toUpperCase() || '';

    // Determine service type
    let serviceType: 'GEL_X' | 'GEL_MANICURE' | 'BUILDER_GEL' = 'GEL_MANICURE';
    if (serviceText.includes('GEL X') || serviceText.includes('GELX') || serviceText === 'GEL X') {
      serviceType = 'GEL_X';
    } else if (serviceText.includes('BUILDER') || serviceText === 'BUILDER GEL') {
      serviceType = 'BUILDER_GEL';
    } else if (serviceText.includes('MANICURE') || serviceText === 'GEL MANICURE') {
      serviceType = 'GEL_MANICURE';
    }

    // Get extended properties if they exist
    const props = event.extendedProperties?.private || {};
    
    // Use extended properties if available, otherwise use defaults
    const nailLength: 'SHORT_MEDIUM' | 'LONG_XLONG' = 
      (props.nailLength as any) || 'SHORT_MEDIUM';
    const estimatedPrice = props.estimatedPrice ? parseFloat(props.estimatedPrice) : 50;
    const status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 
      (props.status as any) || 'SCHEDULED';
    const inspirationText = props.inspirationText || '';

    // Parse add-ons if available
    let addOns = [];
    if (props.addOns) {
      try {
        addOns = JSON.parse(props.addOns);
      } catch (e) {
        console.error('Error parsing add-ons:', e);
      }
    }

    // Download images from Drive if available
    let inspirationPhotos: string[] = [];
    if (props.imageFileIds) {
      const fileIds = props.imageFileIds.split(',');
      try {
        const downloadPromises = fileIds.map(fileId => 
          this.downloadImageFromDrive(fileId.trim())
        );
        inspirationPhotos = await Promise.all(downloadPromises);
      } catch (error) {
        console.error('Error downloading images from Drive:', error);
        // Continue without images
      }
    }

    // Parse date
    const date = new Date(event.start.dateTime);

    return {
      id: event.id,
      date,
      clientName,
      serviceType,
      nailLength,
      addOns,
      inspirationPhotos,
      inspirationText,
      estimatedPrice,
      status,
      googleCalendarEventId: event.id,
      createdAt: date, // Approximate
      updatedAt: date, // Approximate
    };
  },
};

