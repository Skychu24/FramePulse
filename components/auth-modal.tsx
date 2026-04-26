"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.name, formData.password)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setFormData({ email: "", name: "", password: "" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-cyber-gunmetal border border-cyber-steel/50 rounded-xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-cyber-crimson transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyber-crimson mb-2">
            {isLogin ? "Welcome Back" : "Join FramePulse"}
          </h2>
          <p className="text-gray-400">
            {isLogin 
              ? "Access your personalized learning dashboard" 
              : "Start your CCNA learning journey today"
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-cyber-crimson/10 border border-cyber-crimson/30 rounded-lg p-3 mb-6">
            <p className="text-cyber-crimson text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              required
              className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg pl-12 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:border-cyber-crimson focus:outline-none transition-colors"
            />
          </div>

          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
                required
                className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg pl-12 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:border-cyber-crimson focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg pl-12 pr-12 py-3 text-gray-100 placeholder-gray-500 focus:border-cyber-crimson focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyber-crimson transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={switchMode}
              className="ml-2 text-cyber-crimson hover:text-cyber-accent transition-colors font-semibold"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
