import Footer from '@/components/Footer/Footer';
import '@/styles/global.css';
import { Metadata } from 'next';
import 'sweetalert2/dist/sweetalert2.min.css';

export const metadata: Metadata = {
  title: {
    template: '%s | WERP',
    default: 'WERP',
  },
  description: '웹 ERP입니다.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
