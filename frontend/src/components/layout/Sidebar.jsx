import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Layout, 
  Settings, 
  HelpCircle,
  BarChart3 
} from 'lucide-react'

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/resume-builder', icon: FileText, label: 'Resume Builder' },
    { path: '/portfolio-builder', icon: Layout, label: 'Portfolio Builder' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ]

  return (
    <aside className={cn(
      'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-40',
      isOpen ? 'w-64' : 'w-0 md:w-20 overflow-hidden'
    )}>
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                !isOpen && 'md:justify-center md:px-0'
              )}
            >
              <item.icon size={20} />
              {isOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar