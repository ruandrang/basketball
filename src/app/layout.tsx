import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoops Generator',
  description: 'Random Basketball Team Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <header style={{ borderBottom: '1px solid var(--color-border)', padding: '1rem 0', background: 'rgba(15, 17, 21, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1000 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }} className="text-gradient">
              농구 팀 생성기
            </a>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>홈</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
