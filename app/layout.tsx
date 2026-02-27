import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Eisenhower - Project Management',
  description: 'Manage projects with the Eisenhower Matrix and RACI assignments',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/eisenhower-Icon.png',
        media: '(prefers-color-scheme: light)',

      },
      {
        url: '/eisenhower-Icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/eisenhower-Icon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/eisenhower-Icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
