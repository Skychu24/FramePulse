"use client"

import { useState, useEffect, useMemo } from "react"
import { Filter, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiCall } from "@/lib/auth"
import { FilterBar } from "./filter-bar"
import { VideoCard } from "./video-card"
import { EmbedVideoPlayer } from "./embed-video-player"
import { AuthModal } from "@/components/auth-modal"
import { WaitlistModal } from "./waitlist-modal"
import { DownloadReadyModal } from "./download-ready-modal"
import { DownloadWaitlistModal } from "./download-waitlist-modal"


// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Check if date matches filter
const matchesDateFilter = (dateString: string, filter: string) => {
  // If filter is "All Time", return true for all dates
  if (filter === "All Time") {
    return true
  }
  
  // Format the video date to DD-MM-YYYY format
  const videoDate = new Date(dateString)
  const formattedVideoDate = `${videoDate.getDate().toString().padStart(2, '0')}-${(videoDate.getMonth() + 1).toString().padStart(2, '0')}-${videoDate.getFullYear()}`
  
  // Check if the formatted video date matches the selected filter date
  return formattedVideoDate === filter
}

export function VideoCatalog() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("All Time")
  const [subjectFilter, setSubjectFilter] = useState("All Subjects")
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [isDownloadReadyModalOpen, setIsDownloadReadyModalOpen] = useState(false)
  const [isDownloadWaitlistModalOpen, setIsDownloadWaitlistModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<{
    embedUrl: string
    downloadUrl: string
    originalUrl: string
    title: string
  } | null>(null)
  const [allowUser, setAllowUser] = useState("")
  const { isAuthenticated, user } = useAuth()

  // Handle video watch
  const handleWatch = (embedUrl: string, downloadUrl: string, originalUrl: string, title: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    
    // Check view limit
    const checkViewLimit = async () => {
      try {
        // Get current active view sessions
        const activeSessions = await apiCall('/active-sessions')
        
        if (activeSessions.activeViewSessions < 1) {
          // Allow watching - increment active sessions and open player
          const newViewCount = (activeSessions.activeViewSessions || 0) + 1;
          await apiCall('/active-sessions', {
            method: 'PUT',
            body: JSON.stringify({
              activeViewSessions: newViewCount,
              activeDownloadSessions: activeSessions.activeDownloadSessions || 0
            })
          })
          
          // Track watch history
          const videoData = videos.find((v: any) => v.title === title);
          const subject = videoData?.subjects?.[0] || videoData?.subject || 'General';
          
          await apiCall('/user/watch-history', {
            method: 'POST',
            body: JSON.stringify({
              videoId: title,
              title: title,
              subject: subject,
              watchedAt: new Date().toISOString()
            })
          })
          
          // Open video player
          setCurrentVideo({ embedUrl, downloadUrl, originalUrl, title })
          setIsVideoPlayerOpen(true)
        } else {
          // View limit reached - open waitlist modal
          setCurrentVideo({ embedUrl, downloadUrl, originalUrl, title })
          setIsWaitlistModalOpen(true)
        }
      } catch (error) {
        console.error('Failed to check view limit:', error)
        // Fallback to opening video player if there's an error
        setCurrentVideo({ embedUrl, downloadUrl, originalUrl, title })
        setIsVideoPlayerOpen(true)
      }
    }
    
    checkViewLimit()
  }

  // Handle video download
  const handleDownload = (downloadUrl: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    
    // Check download limit
    const checkDownloadLimit = async () => {
      try {
        // Get current active download sessions
        const activeSessions = await apiCall('/active-sessions')
        
        if (activeSessions.activeDownloadSessions < 1) {
          // Allow downloading - open download ready modal
          setCurrentVideo({ embedUrl: '', downloadUrl, originalUrl: downloadUrl, title: '' })
          setIsDownloadReadyModalOpen(true)
        } else {
          // Download limit reached - open download waitlist modal
          setCurrentVideo({ embedUrl: '', downloadUrl, originalUrl: downloadUrl, title: '' })
          setIsDownloadWaitlistModalOpen(true)
        }
      } catch (error) {
        console.error('Failed to check download limit:', error)
        // Fallback to opening download directly if there's an error
        window.open(downloadUrl, '_blank')
      }
    }
    
    checkDownloadLimit()
  }

  // Handle video player close
  const handleVideoPlayerClose = () => {
    setIsVideoPlayerOpen(false)
    setCurrentVideo(null)
  }

  // Handle waitlist modal auto-close
  const handleWaitlistAutoClose = () => {
    setIsWaitlistModalOpen(false)
    
    // Open video player when user is allowed
    if (currentVideo) {
      // Increment activeViewSessions for waitlist user
      const incrementActiveSessions = async () => {
        try {
          const activeSessions = await apiCall('/active-sessions')
          const newViewCount = (activeSessions.activeViewSessions || 0) + 1;
          await apiCall('/active-sessions', {
            method: 'PUT',
            body: JSON.stringify({
              activeViewSessions: newViewCount,
              activeDownloadSessions: activeSessions.activeDownloadSessions || 0
            })
          })
        } catch (error) {
          console.error('Failed to increment active sessions:', error)
        }
      }
      
      incrementActiveSessions()
      setIsVideoPlayerOpen(true)
      
      // Track watch history
      const trackWatch = async () => {
        try {
          const videoData = videos.find((v: any) => v.title === currentVideo.title);
          const subject = videoData?.subjects?.[0] || videoData?.subject || 'General';
          
          await apiCall('/user/watch-history', {
            method: 'POST',
            body: JSON.stringify({
              videoId: currentVideo.title,
              title: currentVideo.title,
              subject: subject,
              watchedAt: new Date().toISOString()
            })
          })
        } catch (error) {
          console.error('Failed to track watch history:', error)
        }
      }
      
      trackWatch()
    }
  }

  // Handle download waitlist modal auto-close
  const handleDownloadWaitlistAutoClose = () => {
    setIsDownloadWaitlistModalOpen(false)
    
    // Open download ready modal when user is allowed
    if (currentVideo) {
      setIsDownloadReadyModalOpen(true)
    }
  }

  // Handle video click for authentication
  const handleVideoClick = (video: any) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    // TODO: Add video to watch history and navigate to video player
  }

  // Fetch videos from MongoDB
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiCall('/videos')
        setVideos(response || [])
      } catch (error) {
        console.error('Failed to fetch videos:', error)
        // Set empty array if API fails
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Listen for global refresh events
  useEffect(() => {
    const handleVideoAdded = (event: CustomEvent) => {
      // Refresh videos and metadata when a new video is added
      const fetchData = async () => {
        try {
          const [videosResponse, metadataResponse] = await Promise.all([
            apiCall('/videos'),
            apiCall('/metadata')
          ])
          setVideos(videosResponse || [])
          // Update FilterBar by triggering a re-render
          window.dispatchEvent(new CustomEvent('metadataUpdated', { detail: metadataResponse }))
        } catch (error) {
          console.error('Failed to refresh data:', error)
        }
      }

      fetchData()
    }

    window.addEventListener('videoAdded', handleVideoAdded as EventListener)
    
    return () => {
      window.removeEventListener('videoAdded', handleVideoAdded as EventListener)
    }
  }, [])

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return videos
      .filter((course: any) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.subjects && course.subjects.some((subject: string) => subject.toLowerCase().includes(searchQuery.toLowerCase()))) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesSubject =
          subjectFilter === "All Subjects" || (course.subjects && course.subjects.includes(subjectFilter))
        
        const matchesDate = matchesDateFilter(course.date, dateFilter)
        
        return matchesSearch && matchesSubject && matchesDate
      })
      .map((course: any) => ({
        ...course,
        date: formatDate(course.date),
      }))
  }, [searchQuery, dateFilter, subjectFilter, videos])

  // Sort courses by newest to oldest
  const sortedCourses = useMemo(() => {
    return filteredCourses.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [filteredCourses])

  const allSubjects = Array.from(new Set(videos.map((course: any) => course.subject || (course.subjects && course.subjects[0])).filter(Boolean)))

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-obsidian flex items-center justify-center">
        <div className="text-cyber-crimson text-xl">Loading FramePulse...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${!isAuthenticated ? 'backdrop-blur-[120px]' : ''}`}>
      {/* Authentication Gate Overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-[120px] z-40 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-cyber-crimson mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6">Please sign in to access the full FramePulse experience</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-cyber-obsidian">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-cyber-crimson mb-4 animate-pulse">
                Academic Video Archive
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Access high-quality screen recordings curated for the batch
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-crimson" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                  placeholder="Search for recordings, instructors, or topics..."
                  className="w-full bg-cyber-obsidian border border-cyber-crimson/50 rounded-lg px-10 py-3 text-gray-100 placeholder-gray-400 focus:border-cyber-crimson focus:outline-none focus:shadow-cyber-crimson focus:shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-cyber-gunmetal border-b border-cyber-steel/50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <FilterBar
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                subjectFilter={subjectFilter}
                onSubjectChange={setSubjectFilter}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-cyber-obsidian">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
            {sortedCourses.map((video: any) => (
              <VideoCard
                key={video.id}
                title={video.title}
                subjects={video.subjects || [video.subject] || []}
                date={video.date}
                thumbnail={video.thumbnail}
                instructor={video.instructor}
                googleDriveLink={video.googleDriveLink}
                isNew={video.isNew}
                onWatch={handleWatch}
                onDownload={handleDownload}
              />
            ))}
          </div>
          
          {sortedCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Video Player */}
      {currentVideo && (
        <EmbedVideoPlayer
          isOpen={isVideoPlayerOpen}
          onClose={handleVideoPlayerClose}
          embedUrl={currentVideo.embedUrl}
          downloadUrl={currentVideo.downloadUrl}
          originalUrl={currentVideo.originalUrl}
          title={currentVideo.title}
          onWatchComplete={() => {
            // Handle video watch completion if needed
          }}
          onDownload={handleDownload}
        />
      )}
      
      {/* Waitlist Modal */}
      {currentVideo && (
        <WaitlistModal
          isOpen={isWaitlistModalOpen}
          onClose={() => setIsWaitlistModalOpen(false)}
          userEmail={user?.email || ''}
          downloadUrl={currentVideo.downloadUrl}
          onAutoClose={handleWaitlistAutoClose}
        />
      )}
      
      {/* Download Ready Modal */}
      {currentVideo && (
        <DownloadReadyModal
          isOpen={isDownloadReadyModalOpen}
          onClose={() => setIsDownloadReadyModalOpen(false)}
          downloadUrl={currentVideo.downloadUrl}
          userEmail={user?.email || ''}
        />
      )}
      
      {/* Download Waitlist Modal */}
      {currentVideo && (
        <DownloadWaitlistModal
          isOpen={isDownloadWaitlistModalOpen}
          onClose={() => setIsDownloadWaitlistModalOpen(false)}
          userEmail={user?.email || ''}
          downloadUrl={currentVideo.downloadUrl}
          onAutoClose={handleDownloadWaitlistAutoClose}
        />
      )}
    </div>
  )
}
