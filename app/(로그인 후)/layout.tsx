import NavBar from '@/components/Header/NavBar';
import '@/styles/global.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      <div className="content">{children}</div>
    </div>
  );
}
