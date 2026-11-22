import { useEffect, useState } from 'react';
import { getProfile } from './api.js';
import useAuth from './useAuth.js';

// Signed-in user's profile ({ email, firstName, lastName, avatarUrl, role, isAdmin }), or null when signed out
// or still loading. Pages that change the profile fire 'profile-change' so every copy reloads.
export const notifyProfileChange = () => window.dispatchEvent(new Event('profile-change'));

export default function useProfile() {
  const loggedIn = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loggedIn) {
      setProfile(null);
      return undefined;
    }
    let alive = true;
    const load = () =>
      getProfile()
        .then((p) => alive && setProfile(p))
        .catch(() => alive && setProfile(null));
    load();
    window.addEventListener('profile-change', load);
    return () => {
      alive = false;
      window.removeEventListener('profile-change', load);
    };
  }, [loggedIn]);

  return profile;
}
