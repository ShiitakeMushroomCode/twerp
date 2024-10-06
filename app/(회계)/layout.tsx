import MenuBar from '@/components/Header/MenuBar';
import '@/styles/global.css';
import React from 'react';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MenuBar />
      <div className="content">{children}</div>
    </div>
  );
}
