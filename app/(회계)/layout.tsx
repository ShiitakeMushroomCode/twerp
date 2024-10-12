import MenuBar from '@/components/Header/MenuBar';
import NavBar from '@/components/Header/NavBar';
import '@/styles/global.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      <MenuBar />
      <div className="content">{children}</div>
    </div>
  );
}
