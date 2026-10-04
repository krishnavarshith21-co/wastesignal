import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWasteData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import './Header.css';

interface HeaderProps {
  title: string;
  onMobileMenuToggle: () => void;
}

export default function Header({ title, onMobileMenuToggle }: HeaderProps) {
  const { dataMode, notifications } = useWasteData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 days');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function handleSignOut() {
    setUserMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="header-mobile-menu btn-ghost" onClick={onMobileMenuToggle} aria-label="Open menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="header-demo-badge">
          <span className="badge badge-demo">
            {dataMode === 'NONE' ? 'NO DATA' : dataMode === 'DEMO' ? 'DEMO DATA' : 'LIVE DATA'}
          </span>
        </div>

        <div className={`header-search ${searchOpen ? 'open' : ''}`}>
          {searchOpen ? (
            <input
              ref={searchRef}
              type="text"
              className="input header-search-input"
              placeholder="Search zones, hotspots, incidents…"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onBlur={() => { if (!searchValue) setSearchOpen(false); }}
              onKeyDown={e => { if (e.key === 'Escape') { setSearchValue(''); setSearchOpen(false); } }}
            />
          ) : (
            <button className="btn-ghost header-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          )}
        </div>

        <select className="select header-date-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option>Last 7 days</option>
          <option>Last 14 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Custom range</option>
        </select>

        <div className="header-notifications" ref={notifRef}>
          <button className="btn-ghost header-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown animate-slide-up">
              <div className="notif-dropdown-header">
                <span className="heading-subsection">Notifications</span>
                <span className="text-meta">{unreadCount} unread</span>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span className="text-small">No notifications. Connect data to begin.</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                      <div className="notif-dot-wrap">
                        {!n.read && <span className={`notif-dot ${n.type === 'ALERT' ? 'alert' : n.type === 'WARNING' ? 'warning' : ''}`} />}
                      </div>
                      <div className="notif-content">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-desc">{n.description}</span>
                        <span className="notif-time">{n.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Menu Dropdown */}
        <div className="header-user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="header-user-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User profile menu"
            title={user ? `${user.name} (${user.workspace})` : 'User profile'}
          >
            <div className="user-avatar-sm">
              {user?.avatarInitials || 'ER'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown animate-slide-up">
              <div className="user-dropdown-header">
                <span className="user-dropdown-name">{user?.name || 'Elena Rostova'}</span>
                <span className="user-dropdown-email">{user?.email || 'operator@wastesignal.io'}</span>
                <span className="user-dropdown-workspace">{user?.workspace || 'Metropolitan Operations Workspace'}</span>
              </div>

              <div className="user-dropdown-body">
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Platform Settings
                </button>

                <button
                  type="button"
                  className="user-dropdown-item danger"
                  onClick={handleSignOut}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

