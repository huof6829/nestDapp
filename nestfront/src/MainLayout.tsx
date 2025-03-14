import { Link, Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="container">
      <nav className="nav-bar">
        <Link to="/trade" className="nav-link">Trade</Link>
        <Link to="/chat" className="nav-link">ChatAI</Link>
      </nav>
      <Outlet />
    </div>
  );
}