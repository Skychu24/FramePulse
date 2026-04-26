"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { apiCall } from "@/lib/auth"

interface DownloadReadyModalProps {
  isOpen: boolean
  onClose: () => void
  downloadUrl: string
  userEmail: string
}

export function DownloadReadyModal({ 
  isOpen, 
  onClose, 
  downloadUrl,
  userEmail 
}: DownloadReadyModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const hasDownloaded = useRef(false)

  useEffect(() => {
    if (isOpen && !hasDownloaded.current) {
      hasDownloaded.current = true
      
      // Increment activeDownloadSessions when modal opens
      const incrementDownloadSessions = async () => {
        try {
          const activeSessions = await apiCall('/active-sessions')
          const newDownloadCount = (activeSessions.activeDownloadSessions || 0) + 1;
          await apiCall('/active-sessions', {
            method: 'PUT',
            body: JSON.stringify({
              activeViewSessions: activeSessions.activeViewSessions || 0,
              activeDownloadSessions: newDownloadCount
            })
          })
        } catch (error) {
          console.error('Failed to increment active download sessions:', error)
        }
      }
      
      incrementDownloadSessions()
      
      // Start download immediately when modal opens
      handleDownload()
    }
    
    // Reset ref when modal closes
    if (!isOpen) {
      hasDownloaded.current = false
    }
  }, [isOpen])

  useEffect(() => {
    const handleTabClose = (event: BeforeUnloadEvent) => {
      if (isOpen) {
        // Decrement activeDownloadSessions using beacon
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/active-sessions/decrement-download`, JSON.stringify({}))
      }
    }

    if (isOpen) {
      window.addEventListener('beforeunload', handleTabClose)
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }
  }, [isOpen])

  const handleDownload = () => {
    setIsDownloading(true)
    window.open(downloadUrl, '_blank')
  }

  const handleClose = () => {
    // Decrement activeDownloadSessions when modal closes
    const decrementDownloadSessions = async () => {
      try {
        const activeSessions = await apiCall('/active-sessions')
        const newDownloadCount = Math.max(0, (activeSessions.activeDownloadSessions || 0) - 1);
        await apiCall('/active-sessions', {
          method: 'PUT',
          body: JSON.stringify({
            activeViewSessions: activeSessions.activeViewSessions || 0,
            activeDownloadSessions: newDownloadCount
          })
        })
      } catch (error) {
        console.error('Failed to decrement active download sessions:', error)
      }
    }
    
    decrementDownloadSessions()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-gunmetal border border-cyber-steel/50 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">The File is Ready to Download</h2>
            <p className="text-cyber-accent text-sm">Your download will start automatically</p>
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

        {/* Download Status */}
        <div className="bg-cyber-obsidian/50 rounded-lg p-4 mb-6 border border-cyber-steel/30">
          <div className="flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDownloading 
                ? 'bg-cyber-crimson/20 animate-pulse' 
                : 'bg-cyber-accent/20'
            }`}>
              <Download className={`w-6 h-6 ${
                isDownloading 
                  ? 'text-cyber-crimson animate-bounce' 
                  : 'text-cyber-accent'
              }`} />
            </div>
          </div>
          <p className="text-center text-gray-300 mt-4">
            {isDownloading ? 'Download started...' : 'Preparing download...'}
          </p>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300 text-center">
            If the download doesn't start automatically, click the button below.
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
          <div className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse mr-2" />
          <span className="text-xs text-gray-400">Download session active</span>
        </div>
      </div>
    </div>
  )
}
