import MenuBar from './MenuBar';
import NavBar from './NavBar';

export default async function Header() {
  return (
    <header>
      <NavBar />
      <MenuBar />
    </header>
  );
}
