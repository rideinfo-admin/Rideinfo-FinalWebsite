import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Bus, 
  UserCog, 
  Users, 
  MessageSquare, 
  Bell, 
  MapPin,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Institutes', path: '/institutes' },
  { icon: Bus, label: 'Buses', path: '/buses' },
  { icon: UserCog, label: 'Drivers', path: '/drivers' },
  { icon: Users, label: 'Coordinators', path: '/coordinators' },
  { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: MapPin, label: 'Live Tracking', path: '/tracking' },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Bus className="h-8 w-8 text-sidebar-primary" />
            <h1 className="text-xl font-bold text-sidebar-foreground">Bus Tracker</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:text-sidebar-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            © 2025 Bus Tracking System
          </p>
        </div>
      </aside>
    </>
  );
};
