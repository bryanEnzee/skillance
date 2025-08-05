"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bot, Send, ChevronLeft, ChevronRight, GripVertical } from "lucide-react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import styles from './ai-sidebar.module.css'
import { useSidebarStore } from "@/store/sidebar-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AISidebar() {
  const { width, isOpen, setIsOpen } = useSidebarStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help you learn about Web3 and blockchain development?",
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

  const highlightMentor = (mentorId: number) => {
    // Dispatch a custom event that the page will listen for
    const event = new CustomEvent('highlightMentor', {
      detail: { mentorId }
    })
    window.dispatchEvent(event)
  }

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

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ""

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        streamedContent += chunk

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
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white p-2 rounded-l-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        animate={{ x: isOpen ? -useSidebarStore(state => state.width) : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        className={`fixed right-0 top-0 h-full z-40 ${styles.aiSidebarBackground} ${styles.aiSidebarShadow}`}
        style={{ width: useSidebarStore(state => state.width) }}
        initial={{ x: useSidebarStore(state => state.width) }}
        animate={{ x: isOpen ? 0 : useSidebarStore(state => state.width) }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className={styles.aiSidebarDivider} />
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-purple-500/20 group flex items-center"
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.pageX
            const startWidth = useSidebarStore.getState().width

            const onMouseMove = (e: MouseEvent) => {
              const delta = startX - e.pageX
              const newWidth = Math.min(
                Math.max(startWidth + delta, useSidebarStore.getState().minWidth),
                useSidebarStore.getState().maxWidth
              )
              useSidebarStore.getState().setWidth(newWidth)
            }

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove)
              document.removeEventListener('mouseup', onMouseUp)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
          }}
        >
          <GripVertical className="w-4 h-4 text-white/0 group-hover:text-white/50 transition-colors absolute left-0" />
        </div>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-white/10">
            <Bot className="h-6 w-6 text-purple-400" />
            <div>
              <h3 className="text-white font-light text-lg">AI Assistant</h3>
              <p className="text-gray-400 text-sm font-light">Your Web3 Learning Guide</p>
            </div>
          </div>

          {/* Messages */}
          <div className={`${styles.messageContainer} ${styles.hideScrollbar}`}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl text-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white"
                        : "bg-white/10 text-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          h2: ({children}) => (
                            <h2 className="text-xl font-semibold mt-6 mb-3 text-purple-300 border-b border-purple-500/20 pb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({children}) => (
                            <h3 className="text-lg font-medium mt-4 mb-2 text-pink-300">
                              {children}
                            </h3>
                          ),
                          p: ({children}) => (
                            <p className="mb-3 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({children}) => (
                            <ul className="list-none space-y-2 mb-4">
                              {children}
                            </ul>
                          ),
                          ol: ({children}) => (
                            <ol className="list-decimal pl-4 mb-4 space-y-2">
                              {children}
                            </ol>
                          ),
                          li: ({children}) => (
                            <li className="flex items-start space-x-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{children}</span>
                            </li>
                          ),
                          code: ({children}) => (
                            <code className="bg-purple-500/10 text-purple-300 rounded px-1.5 py-0.5 font-mono text-sm">
                              {children}
                            </code>
                          ),
                          blockquote: ({children}) => (
                            <blockquote className="border-l-2 border-purple-500/50 pl-4 my-4 text-purple-200 italic">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="border-t border-purple-500/20 my-4" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
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
                  <div className="bg-white/10 text-gray-200 p-3 rounded-xl">
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
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask anything..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light"
                disabled={isTyping}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
