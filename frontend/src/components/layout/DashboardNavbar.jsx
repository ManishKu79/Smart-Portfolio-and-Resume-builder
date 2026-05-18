import React from 'react'
import { Menu, Bell, User, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'

const DashboardNavbar = ({ onMenuClick }) => {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <nav className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-30">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-medium hidden md:block">
              {user?.name || user?.email || 'User'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar