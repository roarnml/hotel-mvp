"use client"

import Link from "next/link"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-black text-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Hotel Info */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Comfort Resort & Suites</h2>
          <p>Affordable Luxury in a place of comfort</p>
          <p className="mt-2">BLOCK 11, Plot 4 & 5 Francis Elusogbon Avenue, Onda Akoja Family Layout, Aba Iya Gani, Dangote Bus Stop, off Ilesa Road, Ile-Ife 220101, Osun</p>
          <p className="mt-1">Email: comfortrs@outlook.com</p>
          <p>Phone: +234 809 803 9194</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-blue-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="#suites" className="hover:text-blue-400 transition">
                Suites
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-blue-400 transition">
                Gallery
              </Link>
            </li>
            {/*<li>
              <Link href="/booking" className="hover:text-blue-400 transition">
                Book Now
              </Link>
            </li>*/}
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-blue-400 transition">
              <FaFacebook size={24} />
            </Link>
            <Link href="#" className="hover:text-pink-500 transition">
              <FaInstagram size={24} />
            </Link>
            <Link href="#" className="hover:text-blue-500 transition">
              <FaTwitter size={24} />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-gray-400 text-center py-4 border-t border-gray-700">
        &copy; {new Date().getFullYear()} Comfort Resort & Suites. All rights reserved.
      </div>
    </footer>
  )
}
