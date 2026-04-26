"use client"

import { useState, useEffect } from "react"
import { Calendar, BookOpen, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiCall } from "@/lib/auth"

interface FilterBarProps {
  dateFilter: string
  subjectFilter: string
  onDateChange: (value: string) => void
  onSubjectChange: (value: string) => void
}

export function FilterBar({
  dateFilter,
  subjectFilter,
  onDateChange,
  onSubjectChange,
}: FilterBarProps) {
  const [subjects, setSubjects] = useState<string[]>(['All Subjects'])
  const [dates, setDates] = useState<string[]>(['All Time'])

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await apiCall('/metadata')
        setSubjects(metadata.subjects || ['All Subjects'])
        setDates(metadata.dates || ['All Time'])
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      }
    }

    fetchMetadata()
  }, [])

  // Listen for metadata updates
  useEffect(() => {
    const handleMetadataUpdated = (event: CustomEvent) => {
      const metadata = event.detail
      setSubjects(metadata.subjects || ['All Subjects'])
      setDates(metadata.dates || ['All Time'])
    }

    window.addEventListener('metadataUpdated', handleMetadataUpdated as EventListener)
    
    return () => {
      window.removeEventListener('metadataUpdated', handleMetadataUpdated as EventListener)
    }
  }, [])

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="w-4 h-4 text-neon-cyan" />
        <span className="text-sm uppercase tracking-wider">Filters</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* Date Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 bg-secondary/50 border-border hover:border-neon-cyan/50 hover:bg-secondary transition-all duration-300 group"
            >
              <Calendar className="w-4 h-4 text-neon-cyan" />
              <span className="text-foreground">
                {dateFilter === "All Time" ? "All Time" : (dates.find((d) => d === dateFilter) || "All Time")}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuRadioGroup value={dateFilter} onValueChange={onDateChange}>
              {dates.map((option) => (
                <DropdownMenuRadioItem
                  key={option}
                  value={option}
                  className="hover:bg-neon-cyan/10 hover:text-neon-cyan cursor-pointer focus:bg-neon-cyan/10 focus:text-neon-cyan"
                >
                  {option.includes('T') ? option.replace('T', ' ') : option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Subject Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 bg-secondary/50 border-border hover:border-neon-pink/50 hover:bg-secondary transition-all duration-300 group"
            >
              <BookOpen className="w-4 h-4 text-neon-pink" />
              <span className="text-foreground">{subjectFilter}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-neon-pink transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuRadioGroup value={subjectFilter} onValueChange={onSubjectChange}>
              {subjects.map((subject) => (
                <DropdownMenuRadioItem
                  key={subject}
                  value={subject}
                  className="hover:bg-neon-pink/10 hover:text-neon-pink cursor-pointer focus:bg-neon-pink/10 focus:text-neon-pink"
                >
                  {subject}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
