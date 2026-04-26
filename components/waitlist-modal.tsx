"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, RefreshCw } from "lucide-react"
import { apiCall } from "@/lib/auth"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  downloadUrl: string
  onAutoClose: () => void
}

export function WaitlistModal({ 
  isOpen, 
  onClose, 
  userEmail, 
  downloadUrl,
  onAutoClose 
}: WaitlistModalProps) {
  const [waitNumber, setWaitNumber] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [yourPosition, setYourPosition] = useState(0)
  const hasAddedToWaitlist = useRef(false)

  useEffect(() => {
    if (isOpen && userEmail && !hasAddedToWaitlist.current) {
      hasAddedToWaitlist.current = true
      
      // Add user to waitlist when modal opens
      apiCall('/waitlist/add', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail })
      })
        .then(data => {
          setWaitNumber(data.viewWaitNumber)
          setYourPosition(data.yourPosition)
        })
        .catch(error => console.error('Failed to add to waitlist:', error))
    }
    
    // Reset ref when modal closes
    if (!isOpen) {
      hasAddedToWaitlist.current = false
    }
  }, [isOpen, userEmail])

  useEffect(() => {
    // Check activeViewSessions and user queue position
    const checkSlotAvailability = async () => {
      try {
        // Get current active sessions
        const activeSessions = await apiCall('/active-sessions')
        
        // Always refresh waitlist data
        const waitlist = await apiCall('/waitlist')
        
        // Update queue numbers and position
        setWaitNumber(waitlist.viewWaitNumber)
        const position = waitlist.viewUserQueue.indexOf(userEmail) + 1
        setYourPosition(position > 0 ? position : 0)
        
        // Check if activeViewSessions is less than limit (1)
        if (activeSessions.activeViewSessions < 1) {
          // Check if user is first in view queue
          if (waitlist.viewUserQueue.length > 0 && waitlist.viewUserQueue[0] === userEmail) {
            // Process queue for this user
            const processResponse = await apiCall('/waitlist/process', { method: 'POST' })
            
            if (processResponse.success) {
              onAutoClose()
            }
          }
        }
      } catch (error) {
        console.error('Error checking slot availability:', error)
      }
    }

    if (isOpen) {
      const interval = setInterval(checkSlotAvailability, 10000) // Check every 10 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen, userEmail, onAutoClose])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await apiCall('/waitlist')
      setWaitNumber(data.viewWaitNumber)
      
      // Find user's position in view queue
      const position = data.viewUserQueue.indexOf(userEmail) + 1
      setYourPosition(position > 0 ? position : 0)
    } catch (error) {
      console.error('Failed to refresh waitlist:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClose = () => {
    // Remove user from waitlist when manually closing
    apiCall('/waitlist/remove', {
      method: 'POST',
      body: JSON.stringify({ email: userEmail })
    }).catch(error => console.error('Failed to remove from waitlist:', error))
    
    onClose()
  }

  const handleDownload = () => {
    window.open(downloadUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-gunmetal border border-cyber-steel/50 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Stream Requests Limit Reached</h2>
            <p className="text-cyber-accent text-sm">Maximum concurrent streams reached</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Waitlist Info */}
        <div className="bg-cyber-obsidian/50 rounded-lg p-4 mb-6 border border-cyber-steel/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Stream Waitlist</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-cyber-crimson">{yourPosition}</span>
                <div>
                  <p className="text-white font-medium">Position in Queue</p>
                  <p className="text-gray-400 text-xs">Total waiting: {waitNumber}</p>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-cyber-accent hover:text-cyber-accent/80"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300 text-center mb-4">
            You can download instead of waiting
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-cyber-accent hover:bg-cyber-accent/80 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-cyber-steel text-gray-300 hover:bg-cyber-steel/20"
          >
            Close
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyber-crimson rounded-full animate-pulse mr-2" />
          <span className="text-xs text-gray-400">Waiting for available stream slot...</span>
        </div>
      </div>
    </div>
  )
}
