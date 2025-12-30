"use client"

import { useEffect, useState } from "react"
import SuiteCard from "@/components/booking/SuiteCard"
import { motion } from "framer-motion"

interface Suite {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  capacity: number
}

export default function Home() {
  const [suites, setSuites] = useState<Suite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuites() {
        try {
          const res = await fetch("/api/suites");
          if (!res.ok) throw new Error("Network response was not ok");

          const json = await res.json();
          setSuites(json.data); // <-- use json.data
        } catch (err) {
          console.error("Failed to fetch suites:", err);
        } finally {
          setLoading(false);
        }

    }
    fetchSuites()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm tracking-widest text-muted-foreground">
        Preparing your private experience…
      </div>
    )
  }

  return (
    <main className="bg-[#75240E] text-white">
      {/* ================= HERO / FIRST IMPRESSION ================= */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background media */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D55605]/40 via-[#75240E]/60 to-[black]" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-light tracking-wide max-w-3xl"
          >
            A private world of comfort,
            <br />
            curated for you.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex gap-6"
          >
            <a
              href="/suites"
              className="px-8 py-4 text-sm uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition"
            >
              Book a Suite
            </a>

            <a
              href="#suites"
              className="px-8 py-4 text-sm uppercase tracking-widest border border-white/40 hover:border-white transition"
            >
              Explore Suites
            </a>
          </motion.div>

          {/* Trust signals */}
          <div className="absolute bottom-10 flex gap-8 text-xs tracking-widest text-white/70">
            <span>★★★★★ Rated</span>
            <span>Michelin-Listed</span>
            <span>World Luxury Awards</span>
          </div>
        </div>
      </section>

      {/* ================= SUITES PREVIEW ================= */}
      <section
        id="suites"
        className="bg-zinc-50 dark:bg-black px-6 py-32 text-black dark:text-white"
      >
        <header className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-wide">
            Signature Suites
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
            Thoughtfully designed spaces where privacy, comfort,
            and quiet luxury intersect.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {suites.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">
              No suites available at the moment.
            </p>
          ) : (
            suites.map((suite) => (
              <SuiteCard
                key={suite.id}
                id={suite.id}
                name={suite.name}
                description={suite.description}
                price={suite.price}
                images={suite.images}
                capacity={suite.capacity}
              />
            ))
          )}
        </div>
      </section>
    </main>
  )
}
