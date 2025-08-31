"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { DataProvider } from "@/contexts/data-context"
import { TopNavigation } from "@/components/top-navigation"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/contexts/auth-context"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {user && <TopNavigation />}
      <main className={user ? "" : ""}>{children}</main>
      <Toaster />
    </>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <DataProvider>
          <LayoutContent>{children}</LayoutContent>
        </DataProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}
