'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  History,
  Target,
  Brain,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Simple Dashboard', href: '/simple-dashboard', icon: Zap },
  // { name: 'Dashboard', href: '/dashboard', icon: Home },
  // { name: 'Completed Trades', href: '/trades', icon: History },
  // { name: 'Current Positions', href: '/positions', icon: Target },
  // { name: 'Analytics', href: '/analytics', icon: Brain },
  // { name: 'Performance', href: '/performance', icon: TrendingUp },
  // { name: 'Market Data', href: '/market', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const NavLink = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'text-gray-300 hover:text-white hover:bg-gray-800'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
      >
        <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`} />
        {!isCollapsed && (
          <span className="font-medium">{item.name}</span>
        )}
        {isActive && !isCollapsed && (
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className={`p-4 border-b border-gray-800 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-8 h-8 text-green-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">NomadVibe</h1>
                  <p className="text-xs text-gray-400">Trading Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {isCollapsed && (
            <div className="mt-2 flex justify-center">
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink 
              key={item.name} 
              item={item}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom navigation */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          {bottomNavigation.map((item) => (
            <NavLink 
              key={item.name} 
              item={item}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </div>

        {/* Status indicator */}
        <div className={`p-4 border-t border-gray-800 ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live Data Connected</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}