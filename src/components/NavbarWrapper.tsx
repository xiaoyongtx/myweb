'use client';

import dynamic from 'next/dynamic';

// Dynamic import is allowed here because this is a Client Component
const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

export default function NavbarWrapper() {
  return <Navbar />;
}