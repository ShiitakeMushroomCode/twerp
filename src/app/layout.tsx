import '@/styles/global.css';
import { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
