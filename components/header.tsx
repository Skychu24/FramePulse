"use client"

import { Play, User, Bell, Menu, X, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useAdminModal } from "@/contexts/AdminModalContext"
import { AuthModal } from "@/components/auth-modal"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { openAdminModal } = useAdminModal()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-cyber-obsidian/80 border-b border-cyber-steel/50">
      {/* Animated top border */}
      <div className="h-0.5 bg-gradient-to-r from-cyber-crimson via-cyber-accent to-cyber-steel animate-pulse" />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative framepulse-logo">
              <Play className="w-8 h-8 text-cyber-crimson" />
              <div className="absolute inset-0 w-8 h-8 text-cyber-crimson blur-md opacity-50">
                <Play className="w-8 h-8" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-wider">
              <span className="text-cyber-crimson">Frame</span>
              <span className="text-gray-100">Pulse</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-gray-100 hover:text-cyber-crimson transition-colors duration-300 text-sm uppercase tracking-wider"
            >
              Recordings
            </a>
            {isAdmin && (
              <button
                onClick={openAdminModal}
                className="text-cyber-crimson hover:text-cyber-accent transition-colors duration-300 text-sm uppercase tracking-wider font-semibold bg-transparent border-none cursor-pointer"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-cyber-crimson/10"
                >
                  <Bell className="w-5 h-5 text-gray-400 hover:text-cyber-crimson" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-crimson rounded-full animate-pulse" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-cyber-steel/50 hover:border-cyber-crimson hover:bg-cyber-crimson/10 transition-all duration-300"
                  >
                    <User className="w-4 h-4 text-cyber-crimson" />
                    <span className="text-gray-100">{user?.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="hover:bg-cyber-crimson/10"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 hover:text-cyber-crimson" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold transition-colors"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-cyber-crimson" />
            ) : (
              <Menu className="w-6 h-6 text-cyber-crimson" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-cyber-steel/50 bg-cyber-obsidian/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-4">
            <a
              href="#"
              className="text-gray-100 hover:text-cyber-crimson transition-colors duration-300 text-sm uppercase tracking-wider py-2"
            >
              Recordings
            </a>
            {isAdmin && (
              <button
                onClick={openAdminModal}
                className="text-cyber-crimson hover:text-cyber-accent transition-colors duration-300 text-sm uppercase tracking-wider font-semibold py-2 bg-transparent border-none cursor-pointer text-left"
              >
                Admin
              </button>
            )}
            <div className="flex items-center gap-4 pt-4 border-t border-cyber-steel/50">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-cyber-crimson/10"
                  >
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-crimson rounded-full" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-cyber-steel/50 hover:border-cyber-crimson hover:bg-cyber-crimson/10"
                  >
                    <User className="w-4 h-4 text-cyber-crimson" />
                    <span className="text-gray-100">{user?.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="hover:bg-cyber-crimson/10"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 hover:text-cyber-crimson" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex-1 bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold"
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
}
