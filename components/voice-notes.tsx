"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mic, Play, Pause, Square, Save, Trash2, Plus, Search, Calendar, Clock, Tag } from "lucide-react"
import { format } from "date-fns"

interface VoiceNote {
  id: string
  title: string
  content: string
  audioUrl?: string
  duration: number
  createdAt: Date
  tags: string[]
  category: string
}

interface VoiceNotesProps {
  className?: string
}

export function VoiceNotes({ className }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [notes, setNotes] = useState<VoiceNote[]>([
    {
      id: "1",
      title: "Budget Review Meeting",
      content:
        "Discussed quarterly budget allocation and identified areas for cost reduction. Need to review entertainment expenses.",
      duration: 120,
      createdAt: new Date("2024-01-15"),
      tags: ["budget", "meeting"],
      category: "Planning",
    },
    {
      id: "2",
      title: "Investment Ideas",
      content: "Research tech stocks and consider diversifying portfolio. Look into index funds for long-term growth.",
      duration: 85,
      createdAt: new Date("2024-01-14"),
      tags: ["investment", "research"],
      category: "Investment",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    category: "General",
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setNewNote((prev) => ({
            ...prev,
            content: prev.content + " " + finalTranscript,
          }))
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        // Here you would typically upload the audio file
        console.log("Recording saved:", audioUrl)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }

    setIsRecording(false)
    setIsAddNoteOpen(true)
  }

  const saveNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: VoiceNote = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        duration: recordingTime,
        createdAt: new Date(),
        tags: newNote.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        category: newNote.category,
      }
      setNotes([note, ...notes])
      setNewNote({ title: "", content: "", tags: "", category: "General" })
      setRecordingTime(0)
      setIsAddNoteOpen(false)
    }
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif">Voice Notes</h2>
          <p className="text-muted-foreground">Record and manage your financial thoughts</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 animate-pulse">
              <Square className="w-4 h-4 mr-2" />
              Stop ({formatDuration(recordingTime)})
            </Button>
          )}
          <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Save Voice Note</DialogTitle>
                <DialogDescription>Add details to your voice note</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Note content (auto-transcribed from voice)"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="note-category">Category</Label>
                    <Input
                      id="note-category"
                      placeholder="e.g., Planning, Investment"
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                    <Input
                      id="note-tags"
                      placeholder="e.g., budget, meeting, ideas"
                      value={newNote.tags}
                      onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveNote}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-serif">{note.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(note.createdAt, "MMM dd, yyyy")}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{formatDuration(note.duration)}</span>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    {isPlaying === note.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{note.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {note.category}
                  </Badge>
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No voice notes yet</h3>
            <p className="text-muted-foreground mb-4">Start recording to capture your financial thoughts and ideas</p>
            <Button onClick={startRecording}>
              <Mic className="w-4 h-4 mr-2" />
              Record Your First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
