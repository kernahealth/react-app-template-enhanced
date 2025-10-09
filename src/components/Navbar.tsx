import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    color: isActive(path) ? '#646cff' : '#ffffff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    background: isActive(path) ? 'rgba(100, 108, 255, 0.1)' : 'transparent',
    transition: 'all 0.2s',
    fontWeight: isActive(path) ? 'bold' : 'normal',
  });

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(100, 108, 255, 0.3)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🚀</span>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>React Template</h2>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')}>
          Home
        </Link>
        <Link to="/users" style={linkStyle('/users')}>
          Users
        </Link>
        <Link to="/about" style={linkStyle('/about')}>
          About
        </Link>
        <Link to="/contact" style={linkStyle('/contact')}>
          Contact
        </Link>
      </div>
    </nav>
  );
}
