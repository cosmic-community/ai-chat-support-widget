import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chat Support Widget - Powered by Cosmic',
  description: 'Modern AI-powered chat support widget that can be embedded into any website. Built with Next.js and Cosmic AI streaming.',
  keywords: 'chat widget, AI support, customer service, Cosmic CMS, Next.js',
  authors: [{ name: 'Cosmic' }],
  openGraph: {
    title: 'AI Chat Support Widget',
    description: 'Modern AI-powered chat support widget with real-time streaming',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get bucket slug for the badge
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}