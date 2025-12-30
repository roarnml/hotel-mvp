"use client"

import Link from "next/link"
import { useState } from "react"
import { FiHome } from "react-icons/fi"
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Suites", href: "/#suites" },
    { name: "Gallery", href: "/gallery" },
  ]

  return (
    <header className="w-full z-50  bg-transparent fixed top-0 left-0 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center text-2xl font-bold text-white gap-2">
            <span><FiHome /></span>
            Comfort Resort & Suites
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-white hover:text-slate-300 font-medium transition after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gray-700 hover:after:w-full after:transition-all"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <HiOutlineXMark size={28} /> : <HiOutlineBars3 size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white/95 backdrop-blur-lg shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } md:hidden z-50`}
      >
        <nav className="flex flex-col p-6 space-y-4 mt-16">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-blue-700 font-medium transition text-lg"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Optional backdrop click to close */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  )
}
