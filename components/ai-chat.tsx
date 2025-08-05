"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: "user" | "assistant"
  content: string
  recommendations?: Array<{
    id: number
    name: string
    title: string
    rating: number
    expertise: string[]
  }>
}

interface AIChatProps {
  type: "mentor" | "freelance"
  onRecommendation?: (id: number) => void
}

const mentorRecommendations = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Full-Stack Developer",
    rating: 4.9,
    expertise: ["React", "Node.js", "System Design"],
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "AI/ML Engineer",
    rating: 4.8,
    expertise: ["Python", "TensorFlow", "Deep Learning"],
  },
]

const freelanceRecommendations = [
  {
    id: 1,
    name: "React E-commerce Platform",
    title: "TechStart Inc.",
    rating: 4.8,
    expertise: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 2,
    name: "AI/ML Model Development",
    title: "DataCorp",
    rating: 4.9,
    expertise: ["Python", "TensorFlow", "PyTorch"],
  },
]

export default function AIChat({ type, onRecommendation }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        type === "mentor"
          ? "Hi! I'm your AI assistant. Tell me what skills you want to learn or what kind of mentorship you're looking for, and I'll recommend the perfect mentors for you."
          : "Hi! I'm your AI assistant. Tell me about the type of project you're looking for, your skills, or budget range, and I'll recommend the best opportunities for you.",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = newMessage.trim()
    setNewMessage("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'chat',
          question: userMessage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      // Create a message placeholder for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ""

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        streamedContent += chunk

        // Update the last message with the accumulated content
        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: streamedContent
          }
          return newMessages
        })
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your request. Please try again.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative">
              <Bot className="h-6 w-6 text-purple-400" />
              <motion.div
                className="absolute inset-0 bg-purple-400/20 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <div>
              <h3 className="text-white font-light text-lg">AI Assistant</h3>
              <p className="text-gray-400 text-sm font-light">
                Get personalized {type === "mentor" ? "mentor" : "project"} recommendations
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-purple-400 ml-auto" />
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto space-y-4 p-4 bg-black/20 rounded-xl mb-4 backdrop-blur-sm">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`p-4 rounded-2xl font-light text-sm mb-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white ml-auto"
                          : "bg-white/10 text-gray-200 backdrop-blur-sm"
                      }`}
                    >
                      {message.role === "user" ? (
                        message.content
                      ) : (
                        <ReactMarkdown
                          components={{
                            h2: ({children}) => <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>,
                            p: ({children}) => <p className="mb-2">{children}</p>,
                            ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            code: ({children}) => <code className="bg-black/30 rounded px-1">{children}</code>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Recommendations */}
                    {message.recommendations && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        {message.recommendations.map((rec) => (
                          <motion.div
                            key={rec.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
                            onClick={() => onRecommendation?.(rec.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-white font-medium text-sm">{rec.name}</h4>
                                <p className="text-gray-400 text-xs">{rec.title}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-400 text-xs">★</span>
                                <span className="text-white text-xs">{rec.rating}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {rec.expertise.slice(0, 3).map((skill) => (
                                <Badge
                                  key={skill}
                                  className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-2 py-0.5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-200 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-3">
            <Input
              placeholder={`Ask about ${type === "mentor" ? "mentors" : "projects"}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
              disabled={isTyping}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 border-0 backdrop-blur-sm px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
