# Google Calendar Integration Setup

## Overview

Your app now syncs appointments to Google Calendar automatically! Here's how to set it up.

## 🚀 Quick Setup (5 minutes)

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "PolishedByLauren")
3. Click "Enable APIs and Services"
4. Search for "Google Calendar API" → Click "Enable"

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Configure Consent Screen":
   - **User Type**: External
   - **App name**: PolishedByLauren
   - **User support email**: your email
   - **Developer contact**: your email
   - Click "Save and Continue" through all steps
   - Under "Test users", add your Gmail address
3. Go back to "Credentials" → "Create Credentials" → "OAuth client ID"
4. Configure:
   - **Application type**: Web application
   - **Name**: PolishedByLauren Web Client
   - **Authorized JavaScript origins**:
     ```
     https://polishedbylauren.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     https://polishedbylauren.vercel.app/api/auth/callback
     ```
5. Click "Create" and **COPY**:
   - ✅ Client ID
   - ✅ Client Secret

### Step 3: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **polishedbylauren**
3. Settings → Environment Variables
4. Add these variables (for **all environments**: Production, Preview, Development):

```
Name: GOOGLE_CLIENT_ID
Value: [paste your client ID].apps.googleusercontent.com

Name: GOOGLE_CLIENT_SECRET
Value: [paste your client secret]

Name: NEXT_PUBLIC_APP_URL
Value: https://polishedbylauren.vercel.app

Name: VITE_GOOGLE_CLIENT_ID
Value: [paste your client ID].apps.googleusercontent.com

Name: VITE_APP_URL
Value: https://polishedbylauren.vercel.app

Name: VITE_GOOGLE_CALENDAR_ID
Value: primary
```

### Step 4: Redeploy

1. Go to Deployments tab in Vercel
2. Click "..." on the latest deployment → "Redeploy"
3. Or run: `vercel --prod`

## ✅ Testing

1. Visit: `https://polishedbylauren.vercel.app`
2. Click **"Connect Google Calendar"** button in top-right
3. Login with your Google account
4. Grant calendar permissions
5. You'll be redirected back (should see green "Connected" badge)
6. Create an appointment → Check your Google Calendar!

## 🎯 How It Works

### When You Create an Appointment:
1. ✅ Saves to localStorage (works offline)
2. ✅ If Google Calendar connected → Creates event in Google Calendar
3. ✅ Stores Google event ID with appointment (for future updates/deletes)

### When You Update an Appointment:
1. ✅ Updates in localStorage
2. ✅ If connected + has event ID → Updates Google Calendar event

### When You Delete an Appointment:
1. ✅ Removes from localStorage
2. ✅ If connected + has event ID → Deletes from Google Calendar

### Event Details in Google Calendar:
- **Title**: "Client Name - Service Type" (e.g., "Sarah - GEL X")
- **Duration**: 1.5 hours (automatic)
- **Color**: Pink (#FF69B4)
- **Description**: Service details, price, inspiration notes

## 🔧 Troubleshooting

### "Connect" button doesn't work
- Check that environment variables are set in Vercel
- Redeploy after adding variables

### OAuth error
- Verify redirect URI matches exactly: `https://polishedbylauren.vercel.app/api/auth/callback`
- Check Client ID and Secret are correct

### Events not syncing
- Check browser console for errors
- Verify you're still connected (green badge)
- Token might have expired - disconnect and reconnect

### Testing locally
Add these to `.env.local`:
```
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
VITE_APP_URL=http://localhost:5173
VITE_GOOGLE_CALENDAR_ID=primary
```

Also add to Google Console redirect URIs: `http://localhost:5173/api/auth/callback`

## 🔐 Security Notes

- ✅ Client secret stays server-side (in Vercel environment variables)
- ✅ Access tokens auto-refresh when expired
- ✅ Refresh tokens stored in localStorage (consider upgrading to httpOnly cookies for production)

## 📱 Features

- ✅ One-click OAuth connection
- ✅ Automatic token refresh
- ✅ Bi-directional sync (create, update, delete)
- ✅ Offline-first (works without Google Calendar)
- ✅ Visual connection status indicator
- ✅ Easy disconnect option

---

**Questions?** Check `implementation-plan.md` for architecture details.

