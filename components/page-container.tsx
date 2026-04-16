import type React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Max width of content. Defaults to "max-w-7xl" */
  maxWidth?: "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-full"
  /** Show galaxy background. Defaults to true */
  galaxy?: boolean
}

/**
 * Unified page wrapper providing consistent spacing, max-width, and galaxy background.
 * Use on all authenticated pages to ensure visual consistency.
 * Note: ClientLayout already adds pt-16 for the fixed TopNavigation.
 */
export function PageContainer({ children, className, maxWidth = "max-w-7xl", galaxy = true }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 relative overflow-hidden">
      {galaxy && (
        <>
          {/* Galaxy background - radial gradients */}
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"
          />

          {/* Stars */}
          <div aria-hidden="true" className="fixed inset-0 opacity-50 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => {
              // Deterministic positions to avoid hydration mismatch
              const top = (i * 37) % 100
              const left = (i * 53) % 100
              const delay = (i % 5) * 0.4
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                  }}
                />
              )
            })}
          </div>
        </>
      )}

      {/* Content wrapper - consistent padding and max-width */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full",
          maxWidth,
          "pt-6 md:pt-8 pb-12 px-4 sm:px-6 lg:px-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Page header with consistent styling - title, description, optional actions.
 */
interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-balance">{title}</h1>
          {description && <p className="text-sm md:text-base text-gray-400 mt-1 text-pretty">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
