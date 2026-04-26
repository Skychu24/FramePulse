"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

interface NeonSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function NeonSearch({ value, onChange, placeholder = "Search courses..." }: NeonSearchProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Outer glow effect */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-cyan rounded-xl blur-md transition-opacity duration-500 ${
          isFocused ? "opacity-75" : "opacity-30"
        }`}
      />
      
      {/* Animated border */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple p-[1px] transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "opacity-50"
        }`}
      >
        <div className="w-full h-full bg-background rounded-lg" />
      </div>

      {/* Input container */}
      <div className="relative flex items-center">
        <Search
          className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${
            isFocused ? "text-neon-cyan" : "text-muted-foreground"
          }`}
        />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none text-base sm:text-lg"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Scan line animation */}
      {isFocused && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-transparent to-transparent animate-pulse" />
        </div>
      )}
    </div>
  )
}
