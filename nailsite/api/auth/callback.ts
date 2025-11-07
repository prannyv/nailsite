import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
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

