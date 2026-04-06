// src/components/layout/Sidebar.js
// AUDIT FIX [3.4]: Added mobile hamburger menu — sidebar is now a drawer on small screens
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard'  },
  { to: '/products',   icon: '📦', label: 'Products'   },
  { to: '/inventory',  icon: '🗃️',  label: 'Inventory'  },
  { to: '/sales',      icon: '🛒', label: 'Sales'      },
  { to: '/reports',    icon: '📈', label: 'Reports', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebarContent = (
    <aside style={{
      width: 'var(--sidebar-w)', background: 'var(--navy)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {/* AUDIT FIX [5.4]: aria-hidden on decorative emoji */}
          <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>
            <span aria-hidden="true">🛍️</span> ENGMart
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Retail Platform</div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} aria-label="Close navigation"
          style={{ display: 'none', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer', padding: 4 }}
          className="sidebar-close-btn">✕</button>
      </div>

      {/* Nav links */}
      {/* AUDIT FIX [5.1]: aria-label on nav landmark */}
      <nav aria-label="Main navigation" style={{ flex: 1, padding: '12px 0' }}>
        {NAV.filter(item => !item.adminOnly || isAdmin).map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
            color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.65)',
            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
            transition: 'all 0.15s',
            minHeight: 44, // AUDIT FIX [3.2]: touch target minimum
          })}>
            <span style={{ fontSize: 16 }} aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{user?.username}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>
          <span aria-hidden="true">{isAdmin ? '👑' : '👤'}</span> {isAdmin ? 'Admin' : 'Staff'}
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px 0', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7,
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13,
          minHeight: 44, // AUDIT FIX [3.2]: touch target
        }}>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="sidebar-desktop" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'var(--sidebar-w)', zIndex: 100 }}>
        {sidebarContent}
      </div>

      {/* Mobile: hamburger button */}
      <button className="sidebar-hamburger" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}
        style={{
          display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 200,
          background: 'var(--navy)', border: 'none', borderRadius: 8,
          color: 'white', fontSize: 20, padding: '8px 12px', cursor: 'pointer',
          minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
        }}>
        ☰
      </button>

      {/* Mobile: backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} aria-hidden="true" style={{
          display: 'none', position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 150,
        }} className="sidebar-backdrop" />
      )}

      {/* Mobile: slide-in drawer */}
      <div className="sidebar-drawer" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-w)', zIndex: 160,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        {sidebarContent}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-hamburger { display: flex !important; }
          .sidebar-backdrop { display: block !important; }
          .sidebar-drawer { display: block !important; }
          .sidebar-close-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
