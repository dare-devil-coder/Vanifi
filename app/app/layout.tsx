import React from 'react'
import { AppShell } from '@/components/layout/app-shell'

export const metadata = {
  title: 'Vani-Fi Dashboard — Financial intelligence for Bharat',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
