"use client"

import { Play, BookOpen, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { convertDriveLink } from "@/lib/drive-utils"
import { apiCall } from "@/lib/auth"

// Subject-specific thumbnail mapping
const getSubjectThumbnail = (subjects: string[], defaultThumbnail: string): string => {
  const subjectList = subjects.map(s => s.toLowerCase());
  
  // Check for LMS Orientation first (highest priority - overrides all other subjects)
  if (subjectList.includes('lms orientation')) {
    return 'https://www.techasoft.com/blog/2021/01/1609606508.png';
  }
  
  // Check for AI (only if not LMS Orientation)
  if (subjectList.includes('ai')) {
    return 'https://www.lockheedmartin.com/content/dam/lockheed-martin/eo/photo/ai-ml/artificial-intelligence-1920.jpg';
  }
  
  // Check for Network (only if not LMS Orientation)
  if (subjectList.includes('network')) {
    return 'https://cdn.slidesharecdn.com/ss_thumbnails/chinkey-200821151313-thumbnail.jpg?width=640&height=640&fit=bounds';
  }
  
  // Check for Python (only if not LMS Orientation)
  if (subjectList.includes('python')) {
    return 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Acz2aMKGEqOmywuX8lFO8A.jpeg';
  }
  
  // Return default thumbnail if no specific subject matches
  return defaultThumbnail;
};

interface VideoCardProps {
  title: string
  subjects: string[]
  date: string
  thumbnail: string
  instructor: string
  googleDriveLink: string
  isNew?: boolean
  onWatch?: (embedUrl: string, downloadUrl: string, originalUrl: string, title: string) => void
  onDownload?: (downloadUrl: string) => void
}

export function VideoCard({
  title,
  subjects,
  date,
  thumbnail,
  instructor,
  googleDriveLink,
  isNew = false,
  onWatch,
  onDownload,
}: VideoCardProps) {
  return (
    <div className="group relative w-full video-card">
      {/* Neon glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-crimson via-cyber-accent to-cyber-steel rounded-lg opacity-0 group-hover:opacity-75 blur transition-all duration-500 group-hover:duration-200" />
      
      <div className="relative bg-cyber-gunmetal rounded-lg overflow-hidden border border-cyber-steel/50 transition-all duration-300 group-hover:border-cyber-crimson/50 h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={getSubjectThumbnail(subjects, thumbnail)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-obsidian via-cyber-obsidian/20 to-transparent opacity-60" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div 
              onClick={() => {
                // Convert Drive link and open video player
                const driveLinks = convertDriveLink(googleDriveLink);
                if (driveLinks && onWatch) {
                  onWatch(driveLinks.embedUrl, driveLinks.downloadUrl, googleDriveLink, title);
                }
              }}
              className="w-16 h-16 rounded-full bg-cyber-crimson/20 backdrop-blur-sm border-2 border-cyber-crimson flex items-center justify-center shadow-[0_0_20px_rgba(220,20,60,0.5)] animate-pulse cursor-pointer"
            >
              <Play className="w-8 h-8 text-cyber-crimson fill-cyber-crimson/30" />
            </div>
          </div>
          
          {/* New badge */}
          {isNew && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-bold bg-cyber-crimson text-white rounded shadow-[0_0_10px_rgba(220,20,60,0.5)]">
                NEW
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Subject tags */}
          <div className="flex flex-wrap gap-1">
            {subjects.slice(0, 2).map((subject, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full border",
                  subject === "Programming" && "bg-cyber-crimson/10 text-cyber-crimson border-cyber-crimson/30",
                  subject === "Design" && "bg-cyber-steel/10 text-cyber-steel border-cyber-steel/30",
                  subject === "Data Science" && "bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30",
                  subject === "AI & ML" && "bg-cyber-gunmetal/10 text-cyber-gunmetal border-cyber-gunmetal/30",
                  subject === "Cybersecurity" && "bg-cyber-shadow/10 text-cyber-shadow border-cyber-shadow/30",
                  !["Programming", "Design", "Data Science", "AI & ML", "Cybersecurity"].includes(subject) && "bg-cyber-gunmetal/10 text-gray-400 border-cyber-steel/30"
                )}
              >
                {subject}
              </span>
            ))}
            {subjects.length > 2 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-cyber-gunmetal/10 text-gray-400 border-cyber-steel/30">
                +{subjects.length - 2}
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-100 line-clamp-2 group-hover:text-cyber-crimson transition-colors duration-300">
            {title}
          </h3>
          
          {/* Meta info */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyber-crimson rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-cyber-crimson">{date}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                // Convert Drive link and call download handler
                const driveLinks = convertDriveLink(googleDriveLink);
                if (driveLinks && onDownload) {
                  onDownload(driveLinks.downloadUrl);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-cyber-steel hover:bg-cyber-accent text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* Bottom neon line */}
        <div className="h-0.5 bg-gradient-to-r from-cyber-crimson via-cyber-accent to-cyber-steel opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}
