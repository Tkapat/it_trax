import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CheckCircle2, CalendarDays, LogOut } from "lucide-react";

export function Layout() {
  const { signOut, user } = useAuth();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        <div style={{ marginBottom: '40px', padding: '0 12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
            trax
          </h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-color-dim)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={18} />
                <span>Today</span>
              </div>
            )}
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-color-dim)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  fontWeight: 500,
                }}
              >
                <CalendarDays size={18} />
                <span>Calendar</span>
              </div>
            )}
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ padding: '0 12px', marginBottom: '12px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            {user?.email}
          </div>
          <button
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              width: '100%',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content-container">
        <Outlet />
      </main>
    </div>
  );
}
