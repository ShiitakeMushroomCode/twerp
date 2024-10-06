import NNavBar from '@/components/Header/NNavBar';
import '@/styles/global.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NNavBar />
      <div className="content">{children}</div>
    </div>
  );
}
