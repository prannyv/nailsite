import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { GoogleCalendarService } from '../../lib/googleCalendar';
import { useStore } from '../../store/useStore';

export const GoogleCalendarConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncAppointmentsFromCalendar = useStore((state) => state.syncAppointmentsFromCalendar);

  useEffect(() => {
    // Check if already authenticated
    setIsConnected(GoogleCalendarService.isAuthenticated());

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('google_auth');
    const tokensParam = params.get('tokens');
    const code = params.get('code');
    const error = params.get('error');

    // Log callback details for debugging
    if (code || error || authStatus) {
      console.log('OAuth Callback Debug:', {
        authStatus,
        hasTokens: !!tokensParam,
        code: code ? 'present' : 'missing',
        error,
        fullUrl: window.location.href,
      });
    }

    if (authStatus === 'success' && tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        console.log('Setting tokens:', { hasAccessToken: !!tokens.access_token, hasRefreshToken: !!tokens.refresh_token });
        GoogleCalendarService.setTokens(tokens);
        setIsConnected(true);
        console.log('✅ Successfully connected to Google Calendar!');
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Error processing tokens:', error);
        alert('Failed to process authentication tokens. Please try again.');
      }
    } else if (authStatus === 'error') {
      console.error('OAuth error from callback');
      alert('Failed to connect to Google Calendar. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (code) {
      // We have a code but no tokens - the callback API route might not be working
      console.warn('⚠️ Received OAuth code but callback API route may not be processing it.');
      console.warn('This usually means the API route is not deployed or environment variables are missing.');
      alert('OAuth code received but callback failed. Check that your API routes are deployed and environment variables are set correctly.');
    } else if (error) {
      console.error('OAuth error from Google:', error);
      alert(`OAuth error: ${error}. Please check your Google Console settings.`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnect = () => {
    setIsLoading(true);
    GoogleCalendarService.startOAuthFlow();
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      GoogleCalendarService.clearTokens();
      setIsConnected(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const appointments = await GoogleCalendarService.syncFromCalendar();
      syncAppointmentsFromCalendar(appointments);
      alert(`Successfully synced ${appointments.length} appointment(s) from Google Calendar!`);
    } catch (error) {
      console.error('Error syncing from calendar:', error);
      alert('Failed to sync from Google Calendar. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
          <Check size={16} />
          <span className="font-medium">Google Calendar Connected</span>
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="gap-2"
          title="Sync appointments from Google Calendar"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
        <button
          onClick={handleDisconnect}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Disconnect"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <CalendarIcon size={16} />
      {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
    </Button>
  );
};

