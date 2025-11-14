import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    // Get the app URL from environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || 'http://localhost:5173';
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Missing OAuth credentials');
      return res.redirect('/?google_auth=error');
    }
    
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/api/auth/callback`
    );
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Return tokens to the client
    // In production, you might want to encrypt these or use httpOnly cookies
    const tokensParam = encodeURIComponent(JSON.stringify(tokens));
    
    return res.redirect(`/?google_auth=success&tokens=${tokensParam}`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return res.redirect('/?google_auth=error');
  }
}

