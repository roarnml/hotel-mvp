import Image from "next/image"
import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-950 text-neutral-100">
      {/* Left: Brand / Atmosphere */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#75240E]">
        {/* Background image */}
        <Image
          src="/images/auth-hotel.jpg" // replace with a luxury hotel image
          alt="Luxury Hotel Interior"
          fill
          priority
          className="object-cover opacity-50"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />

        {/* Brand */}
        <div className="relative z-10">
          <h1 className="text-3xl font-light tracking-wide text-white">
            Comfort Resort & Suites
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            World-class hospitality, thoughtfully delivered
          </p>
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-md text-neutral-300 text-sm leading-relaxed">
          “Luxury is not excess.  
          It is attention to detail, privacy, and time well spent.”
        </div>
      </div>

      {/* Right: Auth Card */}
      <div className="flex items-center justify-center px-6 py-12 bg-transparent text-neutral-900">
        <div className="w-full ">
          {/* Mobile Brand */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-2xl font-light tracking-wide text-gray-300">
              Comfort Resort & Suites
            </h1>
            <p className="text-sm text-white mt-1">
              Premium Hotel Experience
            </p>
          </div>

          {/* Card */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-transparent shadow-xl shadow-black/5 p-8">
            {children}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} Comfort Resorts and Suites. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
