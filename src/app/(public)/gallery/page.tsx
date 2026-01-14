/*"use client"

import { useState } from "react"
import { prisma } from "@/lib/prisma"
import SuiteCard from "@/components/booking/SuiteCard"
import { FaGamepad, FaCocktail, FaConciergeBell, FaTv, FaWifi, FaVolumeMute, FaStar } from "react-icons/fa"
import { Badge } from "lucide-react"

// Dummy carousel images/videos
const heroSlides = [
  { type: "image", src: "/images/auth-hotel.jpg" },
  { type: "image", src: "/rooms/regular/regular-2.jpg" },
  { type: "image", src: "/rooms/vip/VIP-1.jpg" },
  { type: "image", src: "/rooms/vip/VIP-2.jpg" },
  { type: "image", src: "/rooms/vip/VIP-3.jpg" },
  { type: "image", src: "/rooms/vip/VIP-4.jpg" },
  { type: "image", src: "/rooms/vip/VIP-5.jpg" },
  { type: "video", src: "/videos/hero.mp4" },
]

export default async function GalleryPage() {
  const suites = await prisma.suite.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, price: true, images: true },
  })

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Carousel *}
      <div className="relative h-96 w-full overflow-hidden mb-12">
        <Carousel slides={heroSlides} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/50">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#D55605] mb-4">Experience Luxury & Comfort</h1>
          <p className="text-white text-lg md:text-xl">Discover suites & amenities designed for your ultimate stay</p>
        </div>
      </div>

      {/* Suites *}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Suites</h2>
        {suites.length === 0 ? (
          <p className="text-center text-gray-400">No suites available at the moment.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {suites.map((suite: any) => (
              <SuiteCard
                key={suite.id}
                id={suite.id}
                name={suite.name}
                price={suite.price}
                images={suite.images || []}
              />
            ))}
          </div>
        )}
      </section>

      {/* Amenities *}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Hotel Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FaGamepad size={40} />, title: "Gaming Zone", desc: "Level up your fun in our exclusive gaming lounge" },
            { icon: <FaCocktail size={40} />, title: "Bar", desc: "Sip cocktails in our cozy bar with skyline views" },
            { icon: <FaConciergeBell size={40} />, title: "Room Service", desc: "Your comfort, delivered to your door 24/7" },
            { icon: <FaTv size={40} />, title: "Smart TVs", desc: "Entertainment at your fingertips" },
            { icon: <FaWifi size={40} />, title: "Internet", desc: "Stay connected with high-speed Wi-Fi" },
            { icon: <FaVolumeMute size={40} />, title: "Sound Proof Rooms", desc: "Sleep undisturbed in our serene suites" },
          ].map((amenity, idx) => (
            <div key={idx} className="bg-gray-900 p-6 rounded-xl flex flex-col items-center text-center hover:scale-105 transition-transform shadow-lg">
              <div className="text-[#D55605] mb-4">{amenity.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
              <p className="text-gray-300 text-sm">{amenity.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof *}
      <section className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-3xl font-bold mb-6">What Our Guests Say</h2>
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400" />)}
        </div>
        <div className="flex justify-center gap-4">
          <Badge size={32} className="text-[#D55605]" />
          <Badge size={32} className="text-[#D55605]" />
        </div>
      </section>
    </main>
  )
}

// Simple Carousel Component
function Carousel({ slides }: { slides: { type: string; src: string }[] }) {
  const [current, setCurrent] = useState(0)

  const nextSlide = () => setCurrent((current + 1) % slides.length)
  const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length)

  return (
    <div className="relative h-full w-full">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100" : "opacity-0"}`}
        >
          {slide.type === "image" ? (
            <img src={slide.src} className="w-full h-full object-cover" alt={`slide-${idx}`} />
          ) : (
            <video src={slide.src} className="w-full h-full object-cover" autoPlay loop muted />
          )}
        </div>
      ))}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">◀</button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">▶</button>
    </div>
  )
}
*/
// src/app/(public)/gallery/page.tsx
export const dynamic = "force-dynamic"

import GalleryUI from "./GalleryUI"
import { prisma } from "@/lib/prisma"

export default async function GalleryPage() {
  const suites = await prisma.suite.findMany({
    where: {
      isActive: true,
      status: {
        not: "INACTIVE",
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      price: true,
      images: true,
      capacity: true,
      availableRooms: true,
      status: true,
      features: true,
    },
  })

  return <GalleryUI suites={suites} />
}
