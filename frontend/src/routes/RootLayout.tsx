import { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

const NavItem = React.memo(({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'text-sm font-medium transition-all duration-300 hover:text-indigo-600',
        isActive ? 'text-indigo-800 underline underline-offset-4' : 'text-muted-foreground'
      )
    }
  >
    {children}
  </NavLink>
));

export default function RootLayout() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(0);

  const { lastMessage } = useWebSocket('ws://api.skilllink.com/notifications', {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => prev + (data.type === 'new_message' || data.type === 'contract_update' ? 1 : 0));
    },
  });

  const handleLogout = useCallback(() => {
    logout();
    setNotifications(0);
  }, [logout]);

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <header className="border-b bg-gradient-to-r from-indigo-50 to-sky-50">
        <div className="container flex items-center justify-between h-16 gap-4">
          <Link to="/" className="text-xl font-bold text-indigo-800 transition-colors hover:text-indigo-600">
            SkillLink
          </Link>
          <nav className="flex items-center gap-6">
            <NavItem to="/jobs">Browse Jobs</NavItem>
            {user?.role === 'client' && <NavItem to="/client-dashboard">Dashboard</NavItem>}
            {user?.role === 'freelancer' && <NavItem to="/freelancer-dashboard">Dashboard</NavItem>}
            {user?.role === 'client' && <NavItem to="/post-job">Post Job</NavItem>}
            {user && <NavItem to="/wallet">Wallet</NavItem>}
            {user && (
              <NavItem to="/contracts">
                Contracts {notifications > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full animate-pulse">
                    {notifications}
                  </span>
                )}
              </NavItem>
            )}
            {user && <NavItem to="/messages">Messages</NavItem>}
            {user && <NavItem to="/reviews">Reviews</NavItem>}
            {!user ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <Link to="/signup">
                  <Button size="sm" className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-indigo-500 rounded-full">
                    {user.role.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm capitalize text-muted-foreground">{user.role}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-indigo-500 transition-colors border-indigo-500 hover:bg-indigo-50"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container flex-1 py-8">
        <Outlet />
      </main>
      <footer className="py-6 text-sm text-center border-t text-muted-foreground bg-gradient-to-r from-indigo-50 to-sky-50">
        © {new Date().getFullYear()} SkillLink
      </footer>
    </div>
  );
}