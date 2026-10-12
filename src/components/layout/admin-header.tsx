"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, User, LogOut, Mail, MessageSquare, AlertTriangle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface Notification {
  id: string;
  type: 'message' | 'subscriber' | 'security' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

export function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<{name: string, role: string, avatar: string | null} | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUser(data);
      })
      .catch(console.error);
  }, []);

  // Fetch notifications
  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
        }
      })
      .catch(console.error);
  }, []);

  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  // Fallback info
  const displayName = user?.name || 'Admin User';
  const displayRole = user?.role ? user.role.replace('_', ' ') : 'Super Admin';
  const initials = displayName.substring(0, 2).toUpperCase();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <Mail className="h-4 w-4 text-primary" />;
      case 'subscriber': return <User className="h-4 w-4 text-green-500" />;
      case 'security': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 text-muted-foreground hover:text-foreground lg:hidden rounded-md hover:bg-muted/50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:flex flex-col">
          <div className="text-sm text-muted-foreground capitalize">
            Admin / {pathname.split('/').slice(2).join(' / ') || 'Dashboard'}
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            {formattedTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background animate-pulse"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-card border border-border overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/admin/notifications/read-all', { method: 'POST' });
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);
                      } catch (e) {
                        console.error('Failed to mark all as read:', e);
                      }
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <li key={notification.id} className={cn(
                        "px-4 py-3 hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-primary/5"
                      )}>
                        <button
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            if (notification.href) window.location.href = notification.href;
                            setNotificationsOpen(false);
                          }}
                          className="w-full text-left flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="px-4 py-2 border-t border-border">
                <Link
                  href="/admin/inbox"
                  className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  View All Messages
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 pr-3 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium border border-primary/30 overflow-hidden">
              {user?.avatar ? (
                <Image src={user.avatar} alt={displayName} width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden sm:block text-sm text-left">
              <p className="font-medium leading-none">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{displayRole}</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border py-1 animate-in fade-in zoom-in-95">
              <Link 
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="h-4 w-4" /> Profile Settings
              </Link>
              <div className="h-px bg-border my-1" />
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/admin/login';
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
