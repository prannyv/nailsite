import type { Appointment } from '../types/appointment';

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APP_URL = import.meta.env.VITE_APP_URL || 'https://polishedbylauren.vercel.app';

// Storage keys
const TOKENS_KEY = 'google_calendar_tokens';

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
  },

  // Initiate OAuth flow
  startOAuthFlow(): void {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', `${APP_URL}/api/auth/callback`);
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

  // Create calendar event from appointment
  async createEvent(appointment: Appointment): Promise<string> {
    const accessToken = await this.getValidAccessToken();
    
    const event = {
      summary: `${appointment.clientName || 'Nail Appointment'} - ${appointment.serviceType.replace(/_/g, ' ')}`,
      description: `Service: ${appointment.serviceType.replace(/_/g, ' ')}\nPrice: $${appointment.estimatedPrice}\n\nInspiration: ${appointment.inspirationText || 'None'}`,
      start: {
        dateTime: new Date(appointment.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(appointment.date).getTime() + 90 * 60000).toISOString(), // 1.5 hours default
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '4', // Pink color in Google Calendar
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
    
    const event = {
      summary: `${appointment.clientName || 'Nail Appointment'} - ${appointment.serviceType.replace(/_/g, ' ')}`,
      description: `Service: ${appointment.serviceType.replace(/_/g, ' ')}\nPrice: $${appointment.estimatedPrice}\n\nInspiration: ${appointment.inspirationText || 'None'}`,
      start: {
        dateTime: new Date(appointment.date).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(new Date(appointment.date).getTime() + 90 * 60000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: '4',
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
};

