# Environment Variables Setup for Google Calendar Integration

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: PolishedByLauren
   - User support email: your email
   - Add your email to test users
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: PolishedByLauren Web Client
   - Authorized JavaScript origins:
     - `https://polishedbylauren.vercel.app`
     - `http://localhost:5173` (for local testing)
   - Authorized redirect URIs:
     - `https://polishedbylauren.vercel.app/api/auth/callback`
     - `http://localhost:5173/api/auth/callback` (for local testing)
5. Save and copy:
   - **Client ID**
   - **Client Secret**

## Step 3: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (polishedbylauren)
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=https://polishedbylauren.vercel.app
```

5. Add for Vite (frontend variables):

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_APP_URL=https://polishedbylauren.vercel.app
VITE_GOOGLE_CALENDAR_ID=primary
```

**Note:** Use "primary" for the calendar ID to use your main Google Calendar, or specify a specific calendar ID.

## Step 4: Local Development Setup

Create a `.env.local` file in your project root:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:5173

VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_APP_URL=http://localhost:5173
VITE_GOOGLE_CALENDAR_ID=primary
```

## Step 5: Redeploy

After setting environment variables in Vercel:
1. Trigger a new deployment (Settings → Deployments → Redeploy)
2. Or push a new commit to trigger auto-deployment

## Scopes Required

The app requests these Google Calendar permissions:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## Security Notes

- ✅ Client Secret stays on server (in Vercel environment variables)
- ✅ Never exposed to browser
- ✅ Refresh tokens stored in localStorage (encrypted in production would be better)
- ⚠️ For production, consider using httpOnly cookies for tokens instead of localStorage

## Testing

1. Deploy to Vercel
2. Click "Connect Google Calendar"
3. Login with your Google account
4. Grant permissions
5. You'll be redirected back with auth tokens
6. Create an appointment → it syncs to Google Calendar!

