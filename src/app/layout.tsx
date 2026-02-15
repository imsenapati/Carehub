import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-client';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from '@/components/ui/Sidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: 'CareHub - Provider Dashboard',
  description: 'Healthcare provider dashboard for managing daily workflow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <ToastProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-end gap-4 sticky top-0 z-40">
                  <NotificationBell />
                </header>
                <main className="flex-1 p-6">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </div>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
