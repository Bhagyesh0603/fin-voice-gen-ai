"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Play, Pause, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onTranscription: (text: string, amount?: number, category?: string) => void
  className?: string
}

export function VoiceRecorder({ onTranscription, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [speechSupported, setSpeechSupported] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

      if (SpeechRecognition) {
        setSpeechSupported(true)
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
            setTranscript(finalTranscript)
            setError(null)
            processTranscript(finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.log("[v0] Speech recognition error:", event.error)
          setIsRecording(false)
          setIsProcessing(false)

          switch (event.error) {
            case "network":
              setError("Network error. Please check your internet connection and try again.")
              break
            case "not-allowed":
              setError("Microphone access denied. Please allow microphone permissions.")
              break
            case "no-speech":
              setError("No speech detected. Please try speaking again.")
              break
            case "audio-capture":
              setError("Audio capture failed. Please check your microphone.")
              break
            case "service-not-allowed":
              setError("Speech recognition service not available. Try using manual entry.")
              break
            default:
              setError(`Speech recognition error: ${event.error}. You can still add expenses manually.`)
          }
        }

        recognitionRef.current.onend = () => {
          console.log("[v0] Speech recognition ended")
          if (isRecording) {
            try {
              recognitionRef.current.start()
            } catch (err) {
              console.log("[v0] Failed to restart recognition:", err)
            }
          }
        }
      } else {
        setSpeechSupported(false)
        setError(
          "Speech recognition not supported in this browser. You can still record audio and add expenses manually.",
        )
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording])

  const processTranscript = (text: string) => {
    setIsProcessing(true)

    const amountMatch = text.match(/(\$?\d+(?:\.\d{2})?)/g)
    const amount = amountMatch ? Number.parseFloat(amountMatch[0].replace("$", "")) : undefined

    const categories = {
      food: ["food", "restaurant", "lunch", "dinner", "breakfast", "coffee", "pizza", "burger"],
      transport: ["uber", "taxi", "bus", "train", "gas", "fuel", "parking"],
      shopping: ["shopping", "store", "amazon", "clothes", "shoes"],
      entertainment: ["movie", "cinema", "game", "concert", "show"],
      health: ["doctor", "pharmacy", "medicine", "hospital"],
      utilities: ["electricity", "water", "internet", "phone", "bill"],
    }

    let detectedCategory = "other"
    const lowerText = text.toLowerCase()

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        detectedCategory = category
        break
      }
    }

    setTimeout(() => {
      onTranscription(text, amount, detectedCategory)
      setIsProcessing(false)
    }, 1000)
  }

  const startRecording = async () => {
    try {
      setError(null)
      setTranscript("")

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      if (recognitionRef.current && speechSupported) {
        try {
          recognitionRef.current.start()
        } catch (err) {
          console.log("[v0] Speech recognition start error:", err)
          setError("Could not start speech recognition. Audio recording will continue.")
        }
      }

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setError("Microphone access denied. Please allow microphone permissions and try again.")
        } else if (error.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
        } else {
          setError("Failed to start recording. Please try again.")
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.log("[v0] Error stopping speech recognition:", err)
        }
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Voice Expense Entry</h3>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!speechSupported && !error && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">
              Speech recognition not available. You can still record audio and add expenses manually.
            </p>
          </div>
        )}

        <div className="flex justify-center items-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white rounded-full w-16 h-16"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}

          {audioUrl && (
            <Button
              onClick={playRecording}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 bg-transparent"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Say something like: "I spent $15 on lunch at McDonald's"</p>
            {!speechSupported && (
              <p className="text-xs text-muted-foreground">
                Recording audio only - you can add expense details manually after recording
              </p>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-cyan-500">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing your expense...</span>
          </div>
        )}

        {transcript && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
      </div>
    </Card>
  )
}
