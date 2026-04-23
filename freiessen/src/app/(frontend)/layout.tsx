import React from 'react'
import './styles.css'
import Header from './components/Header'

export const metadata = {
  description: 'Viega Dashboard.',
  title: 'Viega Dashboard',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
