import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spinning Kitty - Make the Cat Spin!',
  description: 'An interactive web experience where your spins fuel the legend. Join thousands of spinners worldwide!',
  keywords: 'spinning cat, interactive game, web game, cat spinner',
  authors: [{ name: 'Spinning Kitty Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0a0e17',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐱</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
