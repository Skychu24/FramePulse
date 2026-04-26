"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"
import { VideoCard } from "./video-card"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  subjects: string[]
  date: string
  thumbnail: string
  instructor: string
  isNew?: boolean
}

interface VideoRowProps {
  title: string
  videos: Video[]
  accentColor?: "cyan" | "pink" | "purple" | "crimson" | "steel"
}

export function VideoRow({ title, videos, accentColor = "cyan" }: VideoRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const colorClasses = {
    cyan: "text-neon-cyan",
    pink: "text-neon-pink",
    purple: "text-neon-purple",
    crimson: "text-cyber-crimson",
    steel: "text-cyber-steel",
  }

  const glowClasses = {
    cyan: "shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    pink: "shadow-[0_0_20px_rgba(255,0,128,0.3)]",
    purple: "shadow-[0_0_20px_rgba(128,0,255,0.3)]",
    crimson: "shadow-[0_0_20px_rgba(220,20,60,0.3)]",
    steel: "shadow-[0_0_20px_rgba(74,85,104,0.3)]",
  }

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="relative py-6">
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-xl sm:text-2xl font-bold ${colorClasses[accentColor]} tracking-wide`}>
          {title}
        </h2>
        
        {/* Navigation arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`border-cyber-steel/50 bg-cyber-gunmetal/50 hover:border-cyber-${accentColor}/50 hover:bg-cyber-gunmetal disabled:opacity-30 transition-all duration-300`}
          >
            <ChevronLeft className={`w-5 h-5 ${colorClasses[accentColor]}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`border-cyber-steel/50 bg-cyber-gunmetal/50 hover:border-cyber-${accentColor}/50 hover:bg-cyber-gunmetal disabled:opacity-30 transition-all duration-300`}
          >
            <ChevronRight className={`w-5 h-5 ${colorClasses[accentColor]}`} />
          </Button>
        </div>
      </div>

      {/* Scrollable video container */}
      <div className="relative">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-cyber-obsidian to-transparent z-10 pointer-events-none hidden sm:block" />
        )}
        
        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-cyber-obsidian to-transparent z-10 pointer-events-none hidden sm:block" />
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className={`h-px bg-gradient-to-r from-transparent via-cyber-${accentColor}/30 to-transparent mt-6`} />
    </section>
  )
}
