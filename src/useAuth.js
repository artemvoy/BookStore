import { useEffect, useState } from 'react';
import { isLoggedIn } from './api.js';

// Re-renders when tokens are saved or cleared (api.js fires 'auth-change').
export default function useAuth() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn());
    window.addEventListener('auth-change', sync);
    return () => window.removeEventListener('auth-change', sync);
  }, []);

  return loggedIn;
}
