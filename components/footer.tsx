import { Play } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-cyber-steel/50 bg-cyber-obsidian/50 backdrop-blur-xl mt-16">
      {/* Top neon line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-crimson/50 to-transparent" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* FramePulse Brand - Left */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative framepulse-logo">
                <Play className="w-6 h-6 text-cyber-crimson" />
                <div className="absolute inset-0 w-6 h-6 text-cyber-crimson blur-md opacity-50">
                  <Play className="w-6 h-6" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-wider">
                <span className="text-cyber-crimson">Frame</span>
                <span className="text-cyber-accent">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              A dedicated repository for academic excellence. This platform is an internal resource designed for students to review and master technical coursework at their own pace.
            </p>
          </div>

          {/* Enjoy Text - Right */}
          <div className="flex-shrink-0">
            <p className="text-2xl font-bold text-cyber-accent animate-pulse">
              Enjoy
            </p>
          </div>
        </div>
      </div>

      {/* Decorative grid overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(220, 20, 60, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(220, 20, 60, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
    </footer>
  )
}
