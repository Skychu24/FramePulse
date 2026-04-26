"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiCall } from "@/lib/auth"
import { Plus, Upload, Trash2, Edit, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  subject: string
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

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user, isAdmin } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    date: "",
    duration: "",
    instructor: "",
    thumbnail: "",
    googleDriveLink: "",
    description: "",
    tags: ""
  })

  // Fetch videos when modal opens
  useEffect(() => {
    if (isOpen && isAdmin) {
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

      fetchVideos()
    }
  }, [isOpen, isAdmin])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: new Date(formData.date).toISOString()
      }
      
      await apiCall('/videos', {
        method: 'POST',
        body: JSON.stringify(videoData)
      })
      
      // Reset form and refresh videos
      setFormData({
        title: "",
        subject: "",
        date: "",
        duration: "",
        instructor: "",
        thumbnail: "",
        googleDriveLink: "",
        description: "",
        tags: ""
      })
      setShowAddForm(false)
      
      // Refresh videos list
      const response = await apiCall('/videos')
      setVideos(response || [])
      
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-[120px] z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0B0B] border-2 border-[#8B0000] rounded-xl max-w-6xl max-h-[90vh] w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#8B0000]/30">
          <h2 className="text-2xl font-bold text-cyber-crimson">Admin Control Panel</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-cyber-crimson/10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-[#0B0B0B]">
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
            <div className="bg-[#1A1A1A] border border-[#8B0000]/50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-cyber-crimson mb-4">Add New Video</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Duration *</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 1:30:00"
                      required
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Instructor *</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
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
                      className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., networking, ccna, routing"
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-3 py-2 text-gray-100 text-sm focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3">
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
          <div className="bg-[#1A1A1A] border border-[#8B0000]/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#8B0000]/30">
              <h3 className="text-lg font-bold text-cyber-crimson">Manage Videos ({videos.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0F0F0F] border-b border-[#8B0000]/30">
                  <tr>
                    <th className="text-left p-3 text-gray-300 text-sm">Title</th>
                    <th className="text-left p-3 text-gray-300 text-sm">Subject</th>
                    <th className="text-left p-3 text-gray-300 text-sm">Instructor</th>
                    <th className="text-left p-3 text-gray-300 text-sm">Date</th>
                    <th className="text-left p-3 text-gray-300 text-sm">Duration</th>
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
                      <td className="p-3 text-gray-300 text-sm">{video.subject}</td>
                      <td className="p-3 text-gray-300 text-sm">{video.instructor}</td>
                      <td className="p-3 text-gray-300 text-sm">{new Date(video.date).toLocaleDateString()}</td>
                      <td className="p-3 text-gray-300 text-sm">{video.duration}</td>
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
  )
}
