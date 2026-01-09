"use client"

import { useState, useEffect } from "react"
import SuiteCard from "@/components/booking/SuiteCard"
import { FaGamepad, FaCocktail, FaConciergeBell, FaTv, FaWifi, FaVolumeMute, FaStar } from "react-icons/fa"
import { Badge } from "lucide-react"

// Dummy hero slides (replace with real images/videos)
const heroSlides = [
  { type: "image", src: "/images/auth-hotel.jpg" },
  { type: "image", src: "/rooms/regular/deluxe.jpg" },
  { type: "image", src: "/rooms/regular/family.jpg" },
  { type: "image", src: "/rooms/vip/royal.jpg" },
  { type: "image", src: "/rooms/vip/executive.jpg" },
  { type: "image", src: "/rooms/vip/presidential.jpg" },
  // { type: "video", src: "/videos/hero.mp4" },
]
interface Suite {
  id: string
  name: string
  category: "VIP" | "REGULAR"
  description: string
  price: number
  images: string[]
  capacity: number
  availableRooms: number
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "INACTIVE" | "SOON" | "ACTIVE"
  features?: string[]
  video?: string | null
}

interface GalleryUIProps {
  suites: Suite[]
}

export default function GalleryUI({ suites }: GalleryUIProps) {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Carousel */}
      <div className="relative h-screen w-full overflow-hidden mb-12">
        {/* Slides */}
        <Carousel slides={heroSlides} />

        {/* Overlay text always on top */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/30 z-20 pointer-events-none">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#D55605] mb-4">
            Experience Luxury & Comfort
            </h1>
            <p className="text-white text-lg md:text-xl">
            Discover suites & amenities designed for your ultimate stay
            </p>
        </div>
    </div>

      {/* Suites */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Suites</h2>
        {suites.length === 0 ? (
          <p className="text-center text-gray-400">No suites available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {suites.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No suites available at the moment.
              </p>
            ) : (
              suites.map((suite) => (
                <SuiteCard
                  key={suite.id} // ✅ use id
                    {...suite}
                />
              ))
          
            )}
          </div>
        )}
      </section>

      {/* Amenities */}
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

      {/* Social Proof */}
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

// ----------------------
// Carousel Component
// ----------------------
function Carousel({ slides }: { slides: { type: string; src: string }[] }) {
  const [current, setCurrent] = useState(0)

  // Auto-slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => setCurrent((current + 1) % slides.length)
  const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length)

  return (
    <div className="relative h-full w-full">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ${
            idx === current
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-95 z-0"
          }`}
        >
          {slide.type === "image" ? (
            <img src={slide.src} className="w-full h-full object-cover" alt={`slide-${idx}`} />
          ) : (
            <video src={slide.src} className="w-full h-full object-cover" autoPlay loop muted />
          )}
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-[#75240E]/70 transition-colors"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-[#75240E]/70 transition-colors"
      >
        ▶
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === current ? "bg-[#D55605]" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
