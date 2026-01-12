import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full gradient-blur opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right space-y-1">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-3 w-32" />
             </div>
             <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        {/* Hero Skeleton */}
        <div className="mb-20 flex flex-col sm:flex-row items-center justify-between gap-8">
           <div className="w-full max-w-lg space-y-4">
               <Skeleton className="h-20 w-3/4" />
               <Skeleton className="h-20 w-1/2" />
               <Skeleton className="h-6 w-full" />
               <div className="flex gap-4 pt-4">
                   <Skeleton className="h-12 w-40 rounded-full" />
                   <Skeleton className="h-14 w-40 rounded-2xl" />
               </div>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full max-w-md">
               <Skeleton className="aspect-square rounded-3xl" />
               <Skeleton className="aspect-square rounded-3xl" />
           </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-24 w-full rounded-3xl" />
                <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
             <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-24 w-full rounded-3xl" />
                <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
        </div>
      </div>
    </div>
  )
}
