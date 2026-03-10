import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

// import Navbar from "@/components/layouts/Navbar"
// import Footer from "@/components/layouts/Footer"

export const metadata: Metadata = {
  title: "Comfort Resort & Suites",
  description: "Book premium suites with comfort, luxury, and ease.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        {/* Top Navigation */}
        {/* <Navbar /> */}

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        {/* <Footer /> */}
      </body>
    </html>
  )
}
