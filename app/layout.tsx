import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: "DecentWork - Decentralized Work Platform",
  description: "Connect with mentors and find freelance opportunities in a decentralized ecosystem",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
