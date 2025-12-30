"use client"

import Link from "next/link"
import { Carousel } from "react-responsive-carousel"
import { motion } from "framer-motion"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { formatNaira } from "@/lib/utils"

interface SuiteCardProps {
  id: string
  name: string
  description?: string
  price: number
  images: string[]
  capacity?: number
}

export default function SuiteCard({
  id,
  name,
  description,
  price,
  images,
  capacity,
}: SuiteCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all"
    >
      {/* ================= IMAGE EXPERIENCE ================= */}
      <div className="relative h-64 overflow-hidden">
        {images.length > 0 ? (
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay
            interval={6000}
            swipeable
            className="h-full"
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${name} view ${idx + 1}`}
                className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ))}
          </Carousel>
        ) : (
          <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm text-muted-foreground">
            Image coming soon
          </div>
        )}

        {/* Floating price badge */}
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
          {formatNaira(price)} / night
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-6">
        <h3 className="text-xl font-light tracking-wide text-black dark:text-white">
          {name}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        )}

        {capacity && (
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
            Up to {capacity} guests
          </p>
        )}

        {/* ================= CTA ================= */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/suites/${id}`}
            className="text-sm uppercase tracking-widest text-black dark:text-white border-b border-transparent group-hover:border-black dark:group-hover:border-white transition"
          >
            Reserve
          </Link>

          <span className="text-xs text-zinc-400">
            Limited availability
          </span>
        </div>
      </div>
    </motion.article>
  )
}
