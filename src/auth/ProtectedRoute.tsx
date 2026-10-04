import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#F3F0E8',
        color: '#1D1D1B',
        fontFamily: 'var(--font-sans)',
        gap: '12px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: '2px solid #1D1D1B',
          borderRightColor: 'transparent',
          animation: 'btn-spin 0.6s linear infinite'
        }} />
        <span style={{
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#68655E',
          fontWeight: 600
        }}>
          Verifying Workspace Session…
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
