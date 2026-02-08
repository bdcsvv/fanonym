// app/components/SkeletonLoader.tsx
'use client'

export function ChatSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-zinc-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-700 rounded w-full"></div>
        <div className="h-3 bg-zinc-700 rounded w-4/5"></div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
      <div className="w-12 h-12 bg-zinc-700 rounded-xl mb-4"></div>
      <div className="h-3 bg-zinc-700 rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-zinc-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-5 animate-pulse">
      <div className="w-24 h-24 bg-zinc-700 rounded-full"></div>
      <div>
        <div className="h-8 bg-zinc-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-zinc-700 rounded w-64"></div>
      </div>
    </div>
  )
}

export function MessageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-zinc-800' : 'bg-purple-600/20'} rounded-2xl p-4 animate-pulse`}>
            <div className="h-4 bg-zinc-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-zinc-700 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse">
          <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
            <div className="h-3 bg-zinc-700 rounded w-1/3"></div>
          </div>
          <div className="h-8 w-20 bg-zinc-700 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <ProfileSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      
      <div className="space-y-4">
        <div className="h-6 bg-zinc-700 rounded w-32 animate-pulse"></div>
        <ChatSkeleton />
        <ChatSkeleton />
        <ChatSkeleton />
      </div>
    </div>
  )
}
