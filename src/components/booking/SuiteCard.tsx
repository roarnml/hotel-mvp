/*"use client"

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
      {/* ================= IMAGE EXPERIENCE ================= *}
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

        {/* Floating price badge *}
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
          {formatNaira(price)} / night
        </div>
      </div>

      {/* ================= CONTENT ================= *}
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

        {/* ================= CTA ================= *}
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
*/


/*"use client"

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
  availableRooms: number
}

export default function SuiteCard({
  id,
  name,
  description,
  price,
  images,
  capacity,
  availableRooms,
}: SuiteCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.02, ease: "easeOut" }}
      className="w-full max-w-full group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all"
    >
      {/* ================= IMAGE EXPERIENCE ================= *}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        {images.length > 0 ? (
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay
            interval={6000}
            swipeable
            className="h-full w-full"
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${name} view ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ))}
          </Carousel>
        ) : (
          <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm text-muted-foreground">
            Image coming soon
          </div>
        )}

        {/* Floating price badge *}
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
          {formatNaira(price)} / night
        </div>
      </div>

      {/* ================= CONTENT ================= *}
      <div className="p-6">
        <h3 className="text-xl font-light tracking-wide text-black dark:text-white">
          {name}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        )}
        <span className="text-xs text-zinc-400">
          {availableRooms > 0 ? `${availableRooms} rooms left` : "Sold out"}
        </span>


        {capacity && (
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
            Up to {capacity} guests
          </p>
        )}

        {/* ================= CTA ================= *}
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
*/

"use client"

import Link from "next/link"
import { Carousel } from "react-responsive-carousel"
import { motion } from "framer-motion"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { formatNaira } from "@/lib/utils"

interface SuiteCardProps {
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
}

export default function SuiteCard({
  id,
  name,
  category,
  description,
  price,
  images,
  capacity,
  availableRooms,
  status,
  features = [],
}: SuiteCardProps) {
  const isSoldOut = availableRooms <= 0 || status !== "AVAILABLE"
  const isLowStock = availableRooms > 0 && availableRooms <= 2 && status === "AVAILABLE"

  return (
    <motion.article
      whileHover={{ y: isSoldOut ? 0 : -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`w-full group rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition
        ${isSoldOut ? "opacity-70 cursor-not-allowed" : "hover:shadow-2xl"}`}
    >
      {/* IMAGE / VIDEO */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        {images.length > 0 ? (
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay={!isSoldOut}
            interval={6000}
            swipeable
            className="h-full w-full"
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${name} view ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ))}
          </Carousel>
        ) : (
          <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm text-zinc-500">
            Images coming soon
          </div>
        )}

        {/* PRICE BADGE */}
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur">
          {formatNaira(price)} / night
        </div>

        {/* AVAILABILITY / STATUS BADGE */}
        <div
          className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full backdrop-blur
            ${
              isSoldOut
                ? "bg-red-600/80 text-white"
                : isLowStock
                ? "bg-amber-500/80 text-black"
                : "bg-emerald-600/80 text-white"
            }`}
        >
          {isSoldOut
            ? status === "AVAILABLE"
              ? "Sold out"
              : status
            : isLowStock
            ? `${availableRooms} chalets left`
            : "Available"}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <h3 className="text-xl font-light tracking-wide text-black dark:text-white">
          {name} ({category})
        </h3>

        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
            {description}
          </p>
        )}

        {features.length > 0 && (
          <div className="mt-2 text-xs text-zinc-500 flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-200/20 rounded-full text-zinc-400">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-200 uppercase tracking-widest">
          <span>Up to {capacity} guests</span>
          {!isSoldOut && <span>{availableRooms} chalet{availableRooms > 1 ? "s" : ""} available</span>}
        </div>

        {/* CTA */}
        <div className="mt-6 flex items-center justify-between">
          {isSoldOut ? (
            <span className="text-sm uppercase tracking-widest text-zinc-400">
              Fully booked
            </span>
          ) : (
            <Link
              href={`/suites/${id}`}
              className="text-sm uppercase tracking-widest text-black dark:text-white border-b border-transparent group-hover:border-black dark:group-hover:border-white transition"
            >
              Reserve chalet
            </Link>
          )}

          {isLowStock && !isSoldOut && (
            <span className="text-xs text-amber-600">
              Almost full
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

