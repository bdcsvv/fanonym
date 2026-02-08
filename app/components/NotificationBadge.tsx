// app/components/NotificationBadge.tsx
'use client'

interface NotificationBadgeProps {
  count: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'purple'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  pulse?: boolean
}

export default function NotificationBadge({
  count,
  max = 99,
  size = 'md',
  color = 'red',
  position = 'top-right',
  pulse = true
}: NotificationBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > max ? `${max}+` : count

  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  }

  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  }

  return (
    <span
      className={`
        absolute ${positionClasses[position]}
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full
        flex items-center justify-center
        text-white font-bold
        border-2 border-[#0c0a14]
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {displayCount}
    </span>
  )
}

/**
 * Usage Examples:
 * 
 * // Simple badge
 * <div className="relative">
 *   <BellIcon />
 *   <NotificationBadge count={5} />
 * </div>
 * 
 * // Different positions
 * <NotificationBadge count={10} position="bottom-right" />
 * 
 * // Different colors
 * <NotificationBadge count={3} color="green" />
 * 
 * // Large badge with max
 * <NotificationBadge count={150} max={99} size="lg" />
 * 
 * // No pulse animation
 * <NotificationBadge count={2} pulse={false} />
 */
