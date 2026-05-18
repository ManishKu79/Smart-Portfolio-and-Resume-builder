import React from 'react'
import { motion } from 'framer-motion'

const PortfolioBuilderPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4">Portfolio Builder</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Create stunning portfolios with customizable themes and sections.
      </p>
    </motion.div>
  )
}

export default PortfolioBuilderPage