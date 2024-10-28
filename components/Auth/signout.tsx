'use client';

import { useEffect } from 'react';

export default function SignOutForm({ signout }) {
  useEffect(() => {
    signout();
  }, []);
  return null;
}
