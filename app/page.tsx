"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { VideoCatalog } from "@/components/video-catalog"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/contexts/AuthContext"
import { AdminModalWrapper } from "@/components/admin-modal-wrapper"
import { initializeVideoCardAnimations, animateBackgroundElements, animateCornerDecorations, animateFramePulseLogo } from "@/lib/animations"

export default function Home() {
  useEffect(() => {
    // Initialize animations when component mounts
    const timer = setTimeout(async () => {
      try {
        await initializeVideoCardAnimations('.video-card');
        await animateBackgroundElements();
        await animateCornerDecorations();
        await animateFramePulseLogo();
      } catch (error) {
        // Animations initialized (some features may be limited in SSR)
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col relative bg-cyber-obsidian">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(220, 20, 60, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(220, 20, 60, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyber-crimson/5 rounded-full blur-[120px] animate-pulse gradient-orb" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cyber-steel/5 rounded-full blur-[100px] animate-pulse gradient-orb" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-cyber-gunmetal/5 rounded-full blur-[80px] animate-pulse gradient-orb" style={{ animationDelay: "2s" }} />

        {/* Scanline effect */}
        <div
          className="absolute inset-0 opacity-[0.015] scanline-effect"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220, 20, 60, 0.03) 2px, rgba(220, 20, 60, 0.03) 4px)",
          }}
        />
      </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <VideoCatalog />
          </main>
          <Footer />
        </div>

        {/* Corner decorations */}
        <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-50 opacity-30 corner-decoration">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L30 0 L30 5 L5 5 L5 30 L0 30 Z" fill="url(#cyan-gradient)" />
          <defs>
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC143C" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-50 opacity-30 rotate-90 corner-decoration">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L30 0 L30 5 L5 5 L5 30 L0 30 Z" fill="url(#pink-gradient)" />
          <defs>
            <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A5568" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none z-50 opacity-30 -rotate-90 corner-decoration">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L30 0 L30 5 L5 5 L5 30 L0 30 Z" fill="url(#purple-gradient)" />
          <defs>
            <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2C3E50" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-50 opacity-30 rotate-180 corner-decoration">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L30 0 L30 5 L5 5 L5 30 L0 30 Z" fill="url(#cyan-gradient-2)" />
          <defs>
            <linearGradient id="cyan-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC143C" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      </div>
      <AdminModalWrapper />
    </AuthProvider>
  )
}
