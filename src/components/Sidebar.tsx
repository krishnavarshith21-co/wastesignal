import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useWasteData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: 'overview' },
  { path: '/hotspots', label: 'Hotspots', icon: 'hotspots' },
  { path: '/predictions', label: 'Predictions', icon: 'predictions' },
  { path: '/operations', label: 'Operations', icon: 'operations' },
  { path: '/intelligence', label: 'Intelligence', icon: 'intelligence' },
  { path: '/reports', label: 'Reports', icon: 'reports' },
  { path: '/data-sources', label: 'Data Sources', icon: 'datasources' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const icons: Record<string, ReactNode> = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  hotspots: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  predictions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  operations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
    </svg>
  ),
  intelligence: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  datasources: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { dataMode } = useWasteData();
  const { user } = useAuth();

  return (
    <>
      {mobileOpen && <div className="sidebar-mobile-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {!collapsed && <span className="sidebar-brand-text">WASTESIGNAL</span>}
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {collapsed ? (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-icon">{icons[item.icon]}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status" title={`Data Status: ${dataMode}`}>
            <span className={`status-dot ${dataMode === 'NONE' ? 'inactive' : 'active'}`} />
            {!collapsed && (
              <div className="status-info">
                <span className="text-meta">System Status</span>
                <span className="status-text">
                  {dataMode === 'NONE' ? 'No Data' : dataMode === 'DEMO' ? 'Demo Mode' : 'Connected'}
                </span>
              </div>
            )}
          </div>
          <div className="sidebar-user" title={user ? `${user.name} (${user.workspace})` : (dataMode === 'DEMO' ? 'Demo Analyst' : 'Operational Workspace')}>
            <div className="user-avatar">{user?.avatarInitials || (dataMode === 'DEMO' ? 'D' : 'WS')}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">
                  {user?.name || (dataMode === 'DEMO' ? 'Demo User' : 'Operational User')}
                </span>
                <span className="text-meta">
                  {user?.workspace || (dataMode === 'DEMO' ? 'Synthetic Dataset' : 'No Data Connected')}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
