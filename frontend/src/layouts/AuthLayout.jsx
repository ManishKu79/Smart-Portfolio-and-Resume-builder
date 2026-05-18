import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-neutral-950 dark:to-secondary-950">
      <div className="container-custom py-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout