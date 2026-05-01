/**
 * AppContext — Global application state.
 *
 * Provides: sidebar, dark mode, notifications, modal, current user + role.
 * The `addNotification` function is passed to TicketProvider so that
 * status updates from Personnel propagate here and appear in all topbars.
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { TicketProvider } from '../store/TicketStore';
import useAuthStore from '../stores/authStore';

const AppContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Flash Flood Warning — Zone 4',      body: 'High severity incident reported in San Jose District.',  time: '2 min ago',  read: false, type: 'danger',  portal: 'admin',     link: '/admin/tickets'    },
  { id: 2, title: 'Social Services at 95% capacity',   body: 'Department has exceeded the 90% threshold.',             time: '14 min ago', read: false, type: 'warning', portal: 'admin',     link: '/admin/dashboard'  },
  { id: 3, title: 'New ticket submitted: REQ-2406',    body: 'Pothole reported near Batasan Hills by Juan Dela Cruz.', time: '1 hr ago',   read: false, type: 'info',    portal: 'admin',     link: '/admin/tickets'    },
  { id: 4, title: 'REQ-2401 resolved',                 body: 'Pothole on Main Street has been marked as resolved.',    time: '3 hrs ago',  read: true,  type: 'success', portal: 'resident',  link: '/resident/history' },
  { id: 5, title: 'Weekly report ready',               body: 'Your performance digest for this week is available.',    time: '1 day ago',  read: true,  type: 'info',    portal: 'admin',     link: '/admin/analytics'  },
];

export function AppProvider({ children }) {
  // Initialize dark mode from localStorage, default to true (dark mode)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [darkMode,         setDarkModeState]    = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // default to dark mode
  });
  const [notifications,    setNotifications]    = useState(INITIAL_NOTIFICATIONS);
  const [modal,            setModal]            = useState(null);

  /**
   * Current authenticated user — sourced from the Zustand auth store.
   * The auth store persists to localStorage so it survives page refresh.
   */
  const { user, logout } = useAuthStore();

  // Apply theme class to document root and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Wrapper function to update dark mode state
  const setDarkMode = useCallback((value) => {
    setDarkModeState(typeof value === 'function' ? value : () => value);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(
    () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    []
  );
  const markRead = useCallback(
    (id) => setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x)),
    []
  );

  /**
   * addNotification — called by TicketStore when Personnel updates a status.
   * This is the centralized notification propagation point.
   */
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 20)); // cap at 20
  }, []);

  const openModal  = useCallback((type, props = {}) => setModal({ type, props }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const contextValue = useMemo(() => ({
    sidebarCollapsed, setSidebarCollapsed,
    mobileDrawerOpen, setMobileDrawerOpen,
    darkMode, setDarkMode,
    notifications, unreadCount, markAllRead, markRead, addNotification,
    modal, openModal, closeModal,
    user,
    logout,
  }), [
    sidebarCollapsed, mobileDrawerOpen, darkMode,
    notifications, unreadCount, markAllRead, markRead, addNotification,
    modal, openModal, closeModal, user, logout,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {/* TicketProvider wraps children so all portals share ticket state */}
      <TicketProvider addNotification={addNotification}>
        {children}
      </TicketProvider>
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
