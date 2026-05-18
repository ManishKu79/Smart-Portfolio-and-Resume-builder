import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import DashboardNavbar from '../components/layout/DashboardNavbar'
import { Menu } from 'lucide-react'
import { cn } from '../lib/utils'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={cn(
          'flex-1 transition-all duration-300 mt-16',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout