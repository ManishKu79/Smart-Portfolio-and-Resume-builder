import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        theme="system"
      />
    </div>
  )
}

export default RootLayout