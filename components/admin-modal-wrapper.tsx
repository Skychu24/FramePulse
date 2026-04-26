"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useAdminModal } from "@/contexts/AdminModalContext"
import { apiCall } from "@/lib/auth"
import { Plus, Upload, Trash2, Edit, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  subject?: string
  subjects?: string[]
  date: string
  duration: string
  thumbnail: string
  instructor: string
  isNew?: boolean
  googleDriveLink?: string
  description?: string
  tags?: string[]
  viewCount?: number
}

export function AdminModalWrapper() {
  const { user, isAdmin } = useAuth()
  const { isAdminModalOpen, closeAdminModal } = useAdminModal()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subjects: [] as string[],
    date: "",
    googleDriveLink: "",
    thumbnail: ""
  })
  const [currentSubject, setCurrentSubject] = useState("")
  const [currentThumbnail, setCurrentThumbnail] = useState("")
  const [availableThumbnails, setAvailableThumbnails] = useState<{subject: string, thumbnail: string}[]>([])

  // Fetch videos when modal opens
  useEffect(() => {
    if (isAdminModalOpen && isAdmin) {
      const fetchVideos = async () => {
        try {
          const response = await apiCall('/videos')
          setVideos(response || [])
        } catch (error) {
          console.error('Failed to fetch videos:', error)
        } finally {
          setLoading(false)
        }
      }

      const fetchThumbnails = async () => {
        try {
          const response = await apiCall('/api/metadata')
          if (response.subjectThumbnails) {
            setAvailableThumbnails(response.subjectThumbnails)
          }
        } catch (error) {
          console.error('Failed to fetch thumbnails:', error)
        }
      }
      
      fetchVideos()
      fetchThumbnails()
    }
  }, [isAdminModalOpen, isAdmin])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'subject') {
      setCurrentSubject(value)
    } else if (name === 'thumbnail') {
      setCurrentThumbnail(value)
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const addSubject = () => {
    if (currentSubject.trim() && !formData.subjects.includes(currentSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, currentSubject.trim()]
      })
      setCurrentSubject("")
      setCurrentThumbnail("")
    }
  }

  const removeSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
    })
  }

  const selectSubjectFromDropdown = (subject: string) => {
    if (!formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const videoData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      }
      
      await apiCall('/videos', {
        method: 'POST',
        body: JSON.stringify(videoData)
      })
      
      // Reset form and refresh videos
      setFormData({
        title: "",
        subjects: [],
        date: "",
        googleDriveLink: "",
        thumbnail: ""
      })
      setCurrentSubject("")
      setCurrentThumbnail("")
      setShowAddForm(false)
      
      // Show success notification
      setShowSuccessNotification(true)
      setTimeout(() => setShowSuccessNotification(false), 3000)
      
      // Refresh videos list
      const response = await apiCall('/videos')
      setVideos(response || [])
      
      // Trigger global refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('videoAdded', { detail: { video: videoData } }))
      
    } catch (error) {
      console.error('Failed to add video:', error)
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    
    try {
      await apiCall(`/videos/${videoId}`, {
        method: 'DELETE'
      })
      
      // Refresh videos list
      const response = await apiCall('/videos')
      setVideos(response || [])
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  }

  return (
    <>
      {/* Global Blur Overlay */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[99] backdrop-blur-[120px] bg-black/95" />
      )}

      {/* Admin Modal */}
      {isAdminModalOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-4xl max-h-[90vh] bg-[#0B0B0B] border-2 border-[#E5E5E5] rounded-xl shadow-2xl shadow-white/10 overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#333333] scrollbar-thumb-rounded-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]/20">
            <h2 className="text-2xl font-bold text-cyber-crimson">Admin Control Panel</h2>
            <Button
              onClick={closeAdminModal}
              variant="ghost"
              size="icon"
              className="hover:bg-cyber-crimson/10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Add Video Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Video
                </Button>
              </div>

              {/* Add Video Form */}
              {showAddForm && (
                <div className="bg-[#1A1A1A] border border-[#E5E5E5]/30 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-cyber-crimson mb-4">Add New Video</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm">Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2 text-sm">Subjects *</label>
                        <div className="space-y-3">
                          {/* Subject Tags Display */}
                          {formData.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.subjects.map((subject, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyber-crimson/20 border border-cyber-crimson/50 rounded-full text-cyber-crimson text-sm"
                                >
                                  <span>{subject}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeSubject(subject)}
                                    className="text-cyber-crimson hover:text-cyber-accent transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Subject Input with Plus Button */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                name="subject"
                                value={currentSubject}
                                onChange={handleInputChange}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                                placeholder="Type a subject and click + or press Enter..."
                                className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={addSubject}
                              disabled={!currentSubject.trim()}
                              className="px-4 py-2 bg-cyber-crimson hover:bg-cyber-accent text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          </div>
                          
                          {/* Thumbnail Input for New Subject */}
                          <div className="mt-2">
                            <input
                              type="text"
                              name="thumbnail"
                              value={currentThumbnail}
                              onChange={(e) => setCurrentThumbnail(e.target.value)}
                              placeholder="add thumbnail URL (optional)..."
                              className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                            />
                          </div>
                          
                          {/* Thumbnail Selection Dropdown */}
                          {currentSubject && availableThumbnails.length > 0 && (
                            <div className="mt-2">
                              <select
                                value={currentThumbnail}
                                onChange={(e) => setCurrentThumbnail(e.target.value)}
                                className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                              >
                                <option value="">Select existing thumbnail...</option>
                                {availableThumbnails
                                  .filter(thumb => thumb.subject.toLowerCase() === currentSubject.toLowerCase())
                                  .map((thumb, index) => (
                                    <option key={index} value={thumb.thumbnail}>
                                      {thumb.subject} - {thumb.thumbnail.substring(0, 30)}...
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Quick Add Buttons */}
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => selectSubjectFromDropdown('AI')}
                              className="px-3 py-1 bg-cyber-steel/20 hover:bg-cyber-steel/30 border border-cyber-steel/50 rounded-lg text-cyber-steel text-sm font-medium transition-colors"
                            >
                              AI
                            </button>
                            <button
                              type="button"
                              onClick={() => selectSubjectFromDropdown('Network')}
                              className="px-3 py-1 bg-cyber-accent/20 hover:bg-cyber-accent/30 border border-cyber-accent/50 rounded-lg text-cyber-accent text-sm font-medium transition-colors"
                            >
                              Network
                            </button>
                            <button
                              type="button"
                              onClick={() => selectSubjectFromDropdown('Python')}
                              className="px-3 py-1 bg-cyber-crimson/20 hover:bg-cyber-crimson/30 border border-cyber-crimson/50 rounded-lg text-cyber-crimson text-sm font-medium transition-colors"
                            >
                              Python
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm">Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm">Google Drive Link *</label>
                        <input
                          type="url"
                          name="googleDriveLink"
                          value={formData.googleDriveLink}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-cyber-obsidian border border-white/20 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-white focus:outline-none focus:shadow-white focus:shadow-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <Button
                        type="submit"
                        className="bg-cyber-crimson hover:bg-cyber-accent text-white font-semibold"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Videos List */}
              <div className="bg-[#1A1A1A] border border-[#E5E5E5]/30 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#E5E5E5]/20">
                  <h3 className="text-lg font-bold text-cyber-crimson">Manage Videos ({videos.length})</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0F0F0F] border-b border-[#E5E5E5]/20">
                      <tr>
                        <th className="text-left p-3 text-gray-300 text-sm">Title</th>
                        <th className="text-left p-3 text-gray-300 text-sm">Subject</th>
                        <th className="text-left p-3 text-gray-300 text-sm">Date</th>
                        <th className="text-left p-3 text-gray-300 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video) => (
                        <tr key={video.id} className="border-b border-cyber-steel/30 hover:bg-cyber-obsidian/50">
                          <td className="p-3">
                            <div>
                              <div className="text-gray-100 font-medium text-sm">{video.title}</div>
                              {video.isNew && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-cyber-crimson/20 text-cyber-crimson text-xs rounded-full">
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(video.subjects || (video.subject ? [video.subject] : [])).map((subject: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-0.5 bg-cyber-crimson/20 text-cyber-crimson text-xs rounded-full border border-cyber-crimson/30"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-gray-300 text-sm">{new Date(video.date).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleDelete(video.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {videos.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No videos found. Add your first video to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-[150] bg-cyber-obsidian border border-cyber-crimson rounded-lg px-4 py-3 shadow-lg shadow-cyber-crimson/20 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-crimson rounded-full" />
            <span className="text-cyber-crimson font-medium text-sm">Video added successfully!</span>
          </div>
        </div>
      )}
    </>
  )
}
