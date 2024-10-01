import Footer from '@/components/Footer';
import Header from '@/components/Header/Header';
import '@/styles/global.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | WERP',
    default: 'WERP',
  },
  description: '웹 ERP입니다.',
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <div className="content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
