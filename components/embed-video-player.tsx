"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { apiCall } from "@/lib/auth"

interface EmbedVideoPlayerProps {
  isOpen: boolean
  onClose: () => void
  embedUrl: string
  downloadUrl: string
  originalUrl: string
  title: string
  onWatchComplete?: () => void
  onDownload?: (downloadUrl: string) => void
}

export function EmbedVideoPlayer({ 
  isOpen, 
  onClose, 
  embedUrl, 
  downloadUrl, 
  originalUrl,
  title,
  onWatchComplete,
  onDownload 
}: EmbedVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setWatchStartTime(Date.now())
      setIsClosing(false)
      // Track watch history when modal opens
      onWatchComplete?.()
    }
  }, [isOpen, onWatchComplete])

  useEffect(() => {
    const handleTabClose = (event: BeforeUnloadEvent) => {
      if (isOpen && watchStartTime && !isClosing) {
        // Decrement activeViewSessions using beacon
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/active-sessions/decrement-view`, JSON.stringify({}))
        
        // Send beacon request to track incomplete watch due to tab close
        const watchDuration = Date.now() - watchStartTime
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/incomplete-watch`, JSON.stringify({
          title,
          watchDuration,
          reason: 'tab_close',
          timestamp: new Date().toISOString()
        }))
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isOpen && watchStartTime && !isClosing) {
        // Track when tab becomes hidden (user switches tabs or minimizes)
        const watchDuration = Date.now() - watchStartTime
        navigator.sendBeacon('/api/user/incomplete-watch', JSON.stringify({
          title,
          watchDuration,
          reason: 'tab_hidden',
          timestamp: new Date().toISOString()
        }))
      }
    }

    if (isOpen) {
      window.addEventListener('beforeunload', handleTabClose)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isOpen, watchStartTime, title, isClosing])

  const handleClose = () => {
    setIsClosing(true)
    
    // Get current values and update activeViewSessions
    apiCall('/active-sessions')
      .then(data => {
        const newViewCount = Math.max(0, (data.activeViewSessions || 0) - 1);
        return apiCall('/active-sessions', {
          method: 'PUT',
          body: JSON.stringify({
            activeViewSessions: newViewCount,
            activeDownloadSessions: data.activeDownloadSessions || 0
          })
        });
      })
      .catch(error => console.error('Failed to update active view sessions:', error));
    
    if (watchStartTime) {
      const watchDuration = Date.now() - watchStartTime
      // Track watch completion via close button
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/close-watch`, JSON.stringify({
        title,
        watchDuration,
        reason: 'close_button',
        timestamp: new Date().toISOString()
      }))
    }
    
    onClose()
  }

  const handleDownload = () => {
    // Use parent download handler if available, otherwise fallback to direct download
    if (onDownload) {
      onDownload(downloadUrl)
    } else {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-[120px] z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-cyber-obsidian rounded-xl border border-white/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/30">
          <h3 className="text-lg font-semibold text-gray-100 truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-cyber-accent hover:bg-cyber-accent/80 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black aspect-video max-h-[calc(90vh-8rem)] flex-1 flex items-center justify-center">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="w-12 h-12 border-4 border-cyber-crimson border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Google Drive Embed Iframe */}
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay"
            allowFullScreen
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            onLoad={handleIframeLoad}
            title={title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/30">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Google Drive Player</span>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-crimson hover:text-cyber-accent transition-colors underline"
            >
              Problem with the player? Open in Google Drive
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
