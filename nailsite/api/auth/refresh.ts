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
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
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

