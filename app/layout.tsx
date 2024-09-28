import { Metadata } from 'next';
import { NavBar } from './components/NavBar';

export const metadata: Metadata = {
  title: {
    template: '%s | WERP',
    default: 'WERP',
  },
  description: '웹 ERP입니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
