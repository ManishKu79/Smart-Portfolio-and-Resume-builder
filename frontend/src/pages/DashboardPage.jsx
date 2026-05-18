import React from 'react'
import { motion } from 'framer-motion'
import Card, { CardContent, CardHeader } from '../components/ui/Card'
import { FileText, Layout, TrendingUp, Users } from 'lucide-react'

const DashboardPage = () => {
  const stats = [
    { title: 'Total Resumes', value: '0', icon: FileText, color: 'bg-blue-500' },
    { title: 'Portfolios', value: '0', icon: Layout, color: 'bg-green-500' },
    { title: 'Profile Views', value: '0', icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Downloads', value: '0', icon: Users, color: 'bg-orange-500' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Welcome back! Here's an overview of your portfolio activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Resumes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-neutral-500 text-center py-8">
                No resumes created yet. Start building your first resume!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Portfolios</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-neutral-500 text-center py-8">
                No portfolios created yet. Create your first portfolio!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default DashboardPage