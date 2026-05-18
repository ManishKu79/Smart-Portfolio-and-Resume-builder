import React from 'react'
import { cn } from '../../lib/utils'

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={cn(
      'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
      'transition-all duration-200',
      hover && 'transition-all duration-300 hover:shadow-soft hover:-translate-y-1',
      className
    )}>
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('p-6 border-b border-neutral-200 dark:border-neutral-800', className)}>
    {children}
  </div>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={cn('p-6', className)}>
    {children}
  </div>
)

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('p-6 border-t border-neutral-200 dark:border-neutral-800', className)}>
    {children}
  </div>
)

export default Card