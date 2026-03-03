'use client';

import { useEffect, useState } from 'react';

export function useAdminSession(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch('/api/admin/check-session', {
          credentials: 'include',
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      } catch (error) {
        console.error('Failed to check admin session:', error);
        setIsAdmin(false);
      }
    };

    checkAdminSession();
  }, []);

  return isAdmin;
}
