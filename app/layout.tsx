import type React from "react"
import type { Metadata } from "next"
import { Geist as GeistSans, Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"
import PWAInit from "@/components/pwa/pwa-init"

const geistSans = GeistSans({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = GeistMono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Daily Work DashBoard",
  description: "60-Day Client Plan Dashboard by Taliyo Technologies",
  generator: "Taliyo Technologies",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.jpg" />
      </head>
      <body className="font-sans">
        <PWAInit />
        {children}
      </body>
    </html>
  )
}
