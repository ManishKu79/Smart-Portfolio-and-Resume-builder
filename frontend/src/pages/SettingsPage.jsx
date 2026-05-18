import React from 'react'
import { motion } from 'framer-motion'

const SettingsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Manage your account settings and preferences.
      </p>
    </motion.div>
  )
}

export default SettingsPage