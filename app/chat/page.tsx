"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Video, Phone, MoreVertical, Send } from "lucide-react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"

const conversations = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Full-Stack Developer",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the session! Let me know if you need any follow-up resources.",
    timestamp: "2 min ago",
    unread: 2,
    online: true,
    type: "mentor",
  },
  {
    id: 2,
    name: "TechStart Inc.",
    title: "React E-commerce Project",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Great progress on the authentication module. Can we schedule a review?",
    timestamp: "1 hour ago",
    unread: 0,
    online: false,
    type: "client",
  },
  {
    id: 3,
    name: "Marcus Johnson",
    title: "AI/ML Engineer",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I've prepared some advanced TensorFlow materials for our next session.",
    timestamp: "3 hours ago",
    unread: 1,
    online: true,
    type: "mentor",
  },
]

const messages = [
  {
    id: 1,
    sender: "Sarah Chen",
    content: "Hi! How did the implementation of the authentication system go?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content:
      "It went really well! I managed to implement JWT tokens and the login flow is working perfectly. Thank you for the guidance during our session.",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Sarah Chen",
    content:
      "That's fantastic! I'm glad the session was helpful. For the next step, I'd recommend implementing refresh tokens for better security.",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "Sarah Chen",
    content: "I've shared some resources in our session notes. Let me know if you need any clarification!",
    timestamp: "10:36 AM",
    isOwn: false,
  },
]

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic here
      setNewMessage("")
    }
  }

  return (
    <Navigation>
      <div className="h-screen flex">
        {/* Chat List */}
        <div className="w-80 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-light text-white mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 font-light"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedChat(conversation)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 hover:bg-white/5 ${
                  selectedChat.id === conversation.id ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white">
                        {conversation.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-light mb-2">{conversation.title}</p>
                    <p className="text-sm text-gray-300 truncate font-light">{conversation.lastMessage}</p>
                  </div>

                  {conversation.unread > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">{conversation.unread}</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} alt={selectedChat.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white">
                      {selectedChat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-light text-white">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-400 font-light">
                    {selectedChat.online ? "Online" : "Last seen 2 hours ago"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Phone className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Video className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${message.isOwn ? "order-2" : "order-1"}`}>
                  <div
                    className={`p-4 rounded-2xl font-light ${
                      message.isOwn
                        ? "bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white"
                        : "bg-white/10 text-gray-200 backdrop-blur-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.isOwn ? "text-right" : "text-left"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex space-x-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400 font-light"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  )
}
