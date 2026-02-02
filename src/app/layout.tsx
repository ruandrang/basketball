import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Basketball Club Manager',
  description: '농구 클럽 관리 및 팀 생성 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}
