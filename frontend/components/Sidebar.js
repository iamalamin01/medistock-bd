'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/sales', icon: '🛒', label: 'Sales / POS' },
  { href: '/medicines', icon: '💊', label: 'Medicines' },
  { href: '/purchases', icon: '📦', label: 'Purchases' },
  { href: '/reports', icon: '📈', label: 'Reports' },
  { href: '/users', icon: '👥', label: 'Users' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        💊 <span>MediStock BD</span>
      </div>
      <nav>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? 'active' : ''}>
            {l.icon} <span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div style={{ padding: '16px', borderTop: '1px solid #2d3748', fontSize: 13 }}>
        <div style={{ color: '#a0aec0', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
          <div style={{ textTransform: 'capitalize' }}>{user.role}</div>
        </div>
        <button onClick={logout} style={{ color: '#fc8181', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
