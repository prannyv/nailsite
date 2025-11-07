import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { GoogleCalendarService } from '../../lib/googleCalendar';

export const GoogleCalendarConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    setIsConnected(GoogleCalendarService.isAuthenticated());

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('google_auth');
    const tokensParam = params.get('tokens');

    if (authStatus === 'success' && tokensParam) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        GoogleCalendarService.setTokens(tokens);
        setIsConnected(true);
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Error processing tokens:', error);
      }
    } else if (authStatus === 'error') {
      alert('Failed to connect to Google Calendar. Please try again.');
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

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
          <Check size={16} />
          <span className="font-medium">Google Calendar Connected</span>
        </div>
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

