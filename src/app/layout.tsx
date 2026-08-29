import type { Metadata } from 'next'
import { Providers } from '@/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrustWork - Private AI Freelance Marketplace',
  description: 'Sealed-bid freelance marketplace with blockchain escrow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white font-mono">
        <Providers>
          <nav className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl font-bold">TrustWork</h1>
              <p className="text-xs text-gray-400">Private AI Freelance Marketplace on Monad</p>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto p-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
