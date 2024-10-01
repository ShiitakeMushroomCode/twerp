import '@/styles/global.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="content">{children}</div>
    </div>
  );
}
