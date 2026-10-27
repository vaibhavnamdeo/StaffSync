import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Clock, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Employees', icon: Users, path: '/employees' },
    { label: 'Leave Requests', icon: Calendar, path: '/leaves' },
    { label: 'Attendance', icon: Clock, path: '/attendance' },
    { label: 'Announcements', icon: Megaphone, path: '/announcements' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <p className="font-semibold text-slate-700">StaffSync Portal</p>
        <p className="text-slate-500 mt-1">v1.0.0 • HRM System</p>
      </div>
    </aside>
  );
}
