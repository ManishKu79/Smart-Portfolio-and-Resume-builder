import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PortfolioBuilder</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Build stunning portfolios and resumes that impress recruiters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link to="/features" className="hover:text-primary-600 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link></li>
              <li><Link to="/templates" className="hover:text-primary-600 transition-colors">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link to="/about" className="hover:text-primary-600 transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>&copy; 2024 PortfolioBuilder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer