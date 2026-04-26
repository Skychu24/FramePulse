"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiCall } from "@/lib/auth"
import { Plus, Upload, Trash2, Edit, Eye } from "lucide-react"
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

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth()
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

  // Redirect if not admin (only after auth is loaded)
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      window.location.href = "/"
    }
  }, [isAdmin, authLoading])

  // Fetch videos
  useEffect(() => {
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

    if (isAdmin) {
      fetchVideos()
    }
  }, [isAdmin])

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-obsidian flex items-center justify-center">
        <div className="text-cyber-crimson text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cyber-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyber-crimson mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-obsidian flex items-center justify-center">
        <div className="text-cyber-crimson text-xl">Loading Admin Panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-obsidian">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyber-crimson mb-2">Admin Control Panel</h1>
          <p className="text-gray-400">Manage FramePulse video content</p>
        </div>

        {/* Add Video Button */}
        <div className="mb-8">
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
          <div className="bg-cyber-gunmetal border border-cyber-steel/50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-cyber-crimson mb-6">Add New Video</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 1:30:00"
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Instructor *</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Google Drive Link *</label>
                  <input
                    type="url"
                    name="googleDriveLink"
                    value={formData.googleDriveLink}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., networking, ccna, routing"
                  className="w-full bg-cyber-obsidian border border-cyber-steel/50 rounded-lg px-4 py-2 text-gray-100 focus:border-cyber-crimson focus:outline-none"
                />
              </div>
              
              <div className="flex gap-4">
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
        <div className="bg-cyber-gunmetal border border-cyber-steel/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-cyber-steel/50">
            <h2 className="text-2xl font-bold text-cyber-crimson">Manage Videos ({videos.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-obsidian border-b border-cyber-steel/50">
                <tr>
                  <th className="text-left p-4 text-gray-300">Title</th>
                  <th className="text-left p-4 text-gray-300">Subject</th>
                  <th className="text-left p-4 text-gray-300">Instructor</th>
                  <th className="text-left p-4 text-gray-300">Date</th>
                  <th className="text-left p-4 text-gray-300">Duration</th>
                  <th className="text-left p-4 text-gray-300">Views</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-cyber-steel/30 hover:bg-cyber-obsidian/50">
                    <td className="p-4">
                      <div>
                        <div className="text-gray-100 font-medium">{video.title}</div>
                        {video.isNew && (
                          <span className="inline-block mt-1 px-2 py-1 bg-cyber-crimson/20 text-cyber-crimson text-xs rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{video.subject}</td>
                    <td className="p-4 text-gray-300">{video.instructor}</td>
                    <td className="p-4 text-gray-300">{new Date(video.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300">{video.duration}</td>
                    <td className="p-4 text-gray-300">{video.viewCount || 0}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyber-steel/50 hover:border-cyber-crimson text-gray-300"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyber-steel/50 hover:border-cyber-accent text-gray-300"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
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
              <div className="text-center py-12">
                <p className="text-gray-400">No videos found. Add your first video to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
