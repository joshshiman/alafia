"use client"

import { Fraunces } from "next/font/google"
import { Inter } from "next/font/google"
import { Mic } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useGlobalState } from '../context/GlobalStateContext'; // Adjust path if necessary

const questions = [
  'Who are you inspired by?',
  'What are your interests?',
  'What music do you like?',
  'How are you feeling today?',
  'What do you want to work on?'
]


const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function SurveyPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [fullTranscript, setFullTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  // const [res, setRes] = useState<string[]>([])
  const {
    res, setRes
  } = useGlobalState();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check if browser supports speech recognition
  const SpeechRecognition =
    typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null

  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
    }
  }, [SpeechRecognition])

  useEffect(() => {
    console.log(res)
  }, [res])

  const startRecording = () => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    try {
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
        setTranscript("")
        setInterimTranscript("")
        setFullTranscript("")
      }

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current][0].transcript

        // Build interim transcript
        if (event.results[current].isFinal) {
          setFullTranscript((prev) => prev + " " + result)
        } else {
          setInterimTranscript(result)
        }
      }

      recognition.onerror = (event) => {
        setError("Error occurred during recording: " + event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
      recognitionRef.current = recognition

      // Start timeout to stop recording after inactivity
      timeoutRef.current = setTimeout(() => {
        stopRecording()
      }, 10000) // 10 seconds timeout for inactivity

    } catch (err) {
      setError("Error starting recording")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }
  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setRes([...res, questions[questionIndex] + ": " + fullTranscript])

      // res.push(questions[questionIndex] + ": " + fullTranscript)
      setQuestionIndex(questionIndex + 1)
      setInterimTranscript("")
      setFullTranscript("") // Clear transcript for next question
    } 
  }
  return (
    <main className={`min-h-screen w-full flex flex-col relative ${fraunces.variable} ${inter.variable}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b0707] via-[#8B3A1D] to-[#C17F59] -z-10" />

      <div className="flex flex-col flex-1 px-6 py-8 md:px-12 lg:px-24">
        {/* Logo */}
        <div className="w-32 md:w-40 h-12 relative">
        <Link href="/">
            <Image
                src="/Alafia-Logo.svg?height=48&width=160"
                alt="Alafia Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
            />
        </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          {/* Progress text */}
          <p className="font-sans text-xl text-white/90 mb-6">Let&apos;s learn more about you... ({questionIndex + 1}/5)</p>

          {/* Question */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white text-center mb-16">
            {questions[questionIndex]}
          </h1>

          {/* Microphone button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`
                w-24 h-24 rounded-full bg-[#f5eae5] 
                flex items-center justify-center 
                transition-all hover:scale-105 hover:brightness-110
                relative
                ${isRecording ? "ring-4 ring-white/50" : ""}
              `}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              <Mic className={`w-10 h-10 text-black ${isRecording ? "animate-pulse" : ""}`} />

              {/* Recording animation rings */}
              {isRecording && (
                <>
                  <div className="absolute w-full h-full rounded-full bg-white/20 animate-ping" />
                  <div className="absolute w-full h-full rounded-full bg-white/10 animate-pulse" />
                </>
              )}
            </button>

            <span className="text-white/80 text-sm font-sans">{isRecording ? "Listening..." : "Tap to speak"}</span>
          </div>

          {/* Interim transcript display */}
          {(interimTranscript || fullTranscript) && (
            <div className="mt-8 p-4 bg-white/10 rounded-lg max-w-md w-full">
              <p className="text-white text-center">{(isRecording ? interimTranscript : fullTranscript)}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 rounded-lg max-w-md w-full">
              <p className="text-white text-center text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    {/* Next button */}
    {questionIndex < questions.length - 1 ? (
    <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        aria-label="Next"
    >
        <ChevronRight className="w-6 h-6" />
    </button>
    ) : (
    <Link href="/mosaic">
        <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
        aria-label="Finish"
        onClick={() => {setRes([...res, questions[questionIndex] + ": " + fullTranscript])}}
        >
        <ChevronRight className="w-6 h-6" />
        </button>
    </Link>
    )}
      {/* Footer */}
      <div className="w-full bg-[#1b0707] text-center text-white font-sans text-sm py-4">
        made with <span className="text-red-500">❤️</span> for NSBE Hacks 2025
      </div>
    </main>
  )
}
