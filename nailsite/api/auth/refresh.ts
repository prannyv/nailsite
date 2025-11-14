import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }
  
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || 'http://localhost:5173';
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Missing OAuth credentials');
      return res.status(401).json({ error: 'Missing OAuth credentials' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/api/auth/callback`
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    return res.json({
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ error: 'Failed to refresh token' });
  }
}

