import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-neutral-950 dark:to-secondary-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Build Your Professional Portfolio & Resume
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
              Create stunning resumes and portfolios that impress recruiters.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Get Started
                </button>
              </Link>
              <Link to="/login">
                <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}