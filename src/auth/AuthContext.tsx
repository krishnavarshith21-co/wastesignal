import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  workspace: string;
  avatarInitials: string;
  createdAt: string;
}

export interface SignupData {
  name: string;
  email: string;
  organization: string;
  password?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  fillDemoCredentials: () => { email: string; password: string };
}

const STORAGE_KEY_USER = 'wastesignal_active_user';
const STORAGE_KEY_REGISTRY = 'wastesignal_registered_users';

// Pre-seeded verified demo user for seamless evaluation
const DEFAULT_DEMO_USER: AuthUser = {
  id: 'usr-metro-01',
  name: 'Elena Rostova',
  email: 'operator@wastesignal.io',
  organization: 'Metropolitan Public Works',
  role: 'Lead Operations Analyst',
  workspace: 'Metropolitan Operations Workspace',
  avatarInitials: 'ER',
  createdAt: '2026-01-15T08:00:00Z',
};

const DEFAULT_DEMO_PASSWORD = 'Password123!';

interface StoredCredentials {
  user: AuthUser;
  passwordHash: string;
}

function getStoredUsers(): StoredCredentials[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRY);
    if (!raw) {
      const initial: StoredCredentials[] = [
        { user: DEFAULT_DEMO_USER, passwordHash: DEFAULT_DEMO_PASSWORD }
      ];
      localStorage.setItem(STORAGE_KEY_REGISTRY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [{ user: DEFAULT_DEMO_USER, passwordHash: DEFAULT_DEMO_PASSWORD }];
  }
}

function saveStoredUsers(users: StoredCredentials[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTRY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user registry:', err);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to read saved session:', e);
      localStorage.removeItem(STORAGE_KEY_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password = '', rememberMe = true): Promise<{ success: boolean; error?: string }> {
    // Artificial latency (350ms) to provide a smooth, professional feel without lag
    await new Promise(res => setTimeout(res, 350));

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Work email is required.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Password is required.' };
    }

    const registry = getStoredUsers();
    const match = registry.find(
      u => u.user.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPassword
    );

    if (!match) {
      return { success: false, error: 'Invalid email or password.' };
    }

    setUser(match.user);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(match.user));
    } else {
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(match.user));
    }

    return { success: true };
  }

  async function signup(data: SignupData): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    await new Promise(res => setTimeout(res, 400));

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanOrg = data.organization.trim();
    const cleanPassword = data.password?.trim() || '';

    if (!cleanName) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'A valid work email is required.' };
    if (!cleanOrg) return { success: false, error: 'Organization name is required.' };
    if (cleanPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };

    const registry = getStoredUsers();
    if (registry.some(u => u.user.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'WS';

    const newUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      organization: cleanOrg,
      role: 'Operations Administrator',
      workspace: `${cleanOrg} Workspace`,
      avatarInitials: initials,
      createdAt: new Date().toISOString(),
    };

    registry.push({ user: newUser, passwordHash: cleanPassword });
    saveStoredUsers(registry);

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

    return { success: true, user: newUser };
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      // Ignore
    }
  }

  function fillDemoCredentials() {
    return {
      email: DEFAULT_DEMO_USER.email,
      password: DEFAULT_DEMO_PASSWORD,
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        fillDemoCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
