import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Button from '../ui/Button'
import { Sun, Moon, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg backdrop-saturate-150 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              PortfolioBuilder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {user?.name || user?.email}
                  </span>
                  <Button variant="outline" onClick={logout} size="sm">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col space-y-4">
              <Link to="/features" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600">
                Features
              </Link>
              <Link to="/pricing" className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600">
                Pricing
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="w-full">Dashboard</Button>
                  </Link>
                  <Button onClick={logout} className="w-full">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar