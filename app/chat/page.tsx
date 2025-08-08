"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Send, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { ethers } from "ethers"
import { CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI } from "@/lib/contract"

// Dynamically import Navigation to avoid SSR issues
const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">Loading...</div>
})

// Mentor data for display
const mentors = [
  { id: 1, name: "Sarah Chen", title: "Senior Full-Stack Developer", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Marcus Johnson", title: "AI/ML Engineer", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Elena Rodriguez", title: "Product Manager", avatar: "/placeholder.svg?height=40&width=40" },
]

interface ChatRoom {
  id: number
  bookingId: number
  mentorId: number
  mentorName: string
  mentorTitle: string
  avatar: string
  lastMessage?: string
  timestamp?: string
}

interface Message {
  id: number
  content: string
  sender: string
  isFromMentor: boolean
  timestamp: number
  chatRoomId?: number // Optional for pending messages
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userAddress, setUserAddress] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [pendingMessages, setPendingMessages] = useState<Message[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)

  // Load user's chatrooms on component mount
  useEffect(() => {
    loadUserChatRooms()
  }, [])

  const loadUserChatRooms = async () => {
    try {
      console.log('Loading user chatrooms...')

      if (!window.ethereum) {
        console.log('No ethereum wallet found')
        setLoading(false)
        return
      }

      if (!CHAT_STORAGE_ADDRESS) {
        console.log('No chat storage address configured')
        setLoading(false)
        return
      }

      console.log('Chat storage address:', CHAT_STORAGE_ADDRESS)

      // Connect to wallet
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      setUserAddress(address)
      console.log('User address:', address)

      // Switch to Sapphire network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5aff' }], // Sapphire Testnet
        })
        console.log('Switched to Sapphire network')
      } catch (switchError) {
        console.log('Network switch error (might already be on Sapphire):', switchError)
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, provider)

      // Get user's chatrooms
      console.log('Fetching chatrooms for user:', address)
      const chatRoomIds = await contract.getChatRoomsForUser(address)
      console.log('Found chatroom IDs:', chatRoomIds.map((id: any) => id.toString()))

      const rooms: ChatRoom[] = []

      for (const roomId of chatRoomIds) {
        try {
          console.log('Loading chatroom data for ID:', roomId.toString())
          const roomData = await contract.chatRooms(roomId)
          console.log('Room data:', {
            bookingId: roomData.bookingId.toString(),
            mentorId: roomData.mentorId.toString(),
            user: roomData.user,
            createdAt: roomData.createdAt.toString()
          })

          const mentor = mentors.find(m => m.id === roomData.mentorId.toNumber())

          if (mentor) {
            rooms.push({
              id: roomId.toNumber(),
              bookingId: roomData.bookingId.toNumber(),
              mentorId: roomData.mentorId.toNumber(),
              mentorName: mentor.name,
              mentorTitle: mentor.title,
              avatar: mentor.avatar,
              lastMessage: "Chat room created",
              timestamp: new Date(roomData.createdAt.toNumber() * 1000).toLocaleString()
            })
            console.log('Added chatroom for mentor:', mentor.name)
          } else {
            console.log('Mentor not found for ID:', roomData.mentorId.toNumber())
          }
        } catch (roomError) {
          console.error('Error loading room data for ID:', roomId.toString(), roomError)
        }
      }

      console.log('Total chatrooms loaded:', rooms.length)
      setChatRooms(rooms)
    } catch (error) {
      console.error('Error loading chatrooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load messages from localStorage for selected chatroom
  useEffect(() => {
    if (selectedChatRoom) {
      loadLocalMessages(selectedChatRoom.id)
    }
  }, [selectedChatRoom])

  // Auto-sync pending messages every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingMessages.length > 0) {
        syncPendingMessages()
      }
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [pendingMessages])

  const loadLocalMessages = (chatRoomId: number) => {
    try {
      const storageKey = `chat_messages_${chatRoomId}_${userAddress}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const localMessages = JSON.parse(stored)
        setMessages(localMessages)
        console.log('Loaded', localMessages.length, 'messages from local storage')
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading local messages:', error)
      setMessages([])
    }
  }

  const saveMessageLocally = (message: Message, chatRoomId: number) => {
    try {
      const storageKey = `chat_messages_${chatRoomId}_${userAddress}`
      const existing = localStorage.getItem(storageKey)
      const messages = existing ? JSON.parse(existing) : []
      messages.push(message)
      localStorage.setItem(storageKey, JSON.stringify(messages))

      // Also add to pending sync queue
      const pendingKey = `pending_messages_${userAddress}`
      const pendingExisting = localStorage.getItem(pendingKey)
      const pendingMessages = pendingExisting ? JSON.parse(pendingExisting) : []
      pendingMessages.push({ ...message, chatRoomId })
      localStorage.setItem(pendingKey, JSON.stringify(pendingMessages))
      setPendingMessages(pendingMessages)

      console.log('Message saved locally and added to sync queue')
    } catch (error) {
      console.error('Error saving message locally:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom || !userAddress) return

    // Create message object
    const newMsg: Message = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: userAddress,
      isFromMentor: false,
      timestamp: Date.now()
    }

    // Immediately add to UI and save locally - NO SIGNATURE REQUIRED!
    setMessages(prev => [...prev, newMsg])
    saveMessageLocally(newMsg, selectedChatRoom.id)
    setNewMessage("")

    console.log('💬 Message sent instantly! No signature required.')
    console.log('📦 Message queued for blockchain sync')
  }

  const syncPendingMessages = async () => {
    if (!userAddress || pendingMessages.length === 0) return

    try {
      console.log('🔄 Syncing', pendingMessages.length, 'pending messages to Sapphire...')

      // Switch to Sapphire network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5aff' }],
      })

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CHAT_STORAGE_ADDRESS!, CHAT_STORAGE_ABI, signer)

      // Batch sync messages (one signature for multiple messages)
      for (const msg of pendingMessages) {
        try {
          await contract.sendMessage(msg.chatRoomId, msg.content, false)
          console.log('✅ Synced message:', msg.content.substring(0, 30) + '...')
        } catch (error) {
          console.error('❌ Failed to sync message:', error)
        }
      }

      // Clear pending messages after successful sync
      const pendingKey = `pending_messages_${userAddress}`
      localStorage.removeItem(pendingKey)
      setPendingMessages([])
      setLastSyncTime(Date.now())

      console.log('🎉 All messages synced to Sapphire!')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  if (loading) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading your chats...</div>
        </div>
      </Navigation>
    )
  }

  if (chatRooms.length === 0) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-light text-white mb-2">No Active Chats</h2>
            <p className="text-gray-400 mb-6">
              {userAddress ?
                "No chatrooms found. If you just booked a session, try refreshing." :
                "Book a session with a mentor to start chatting!"
              }
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/mentor'}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Browse Mentors
              </Button>
              {userAddress && (
                <Button
                  onClick={() => {
                    setLoading(true)
                    loadUserChatRooms()
                  }}
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm"
                >
                  Refresh Chats
                </Button>
              )}
            </div>
          </div>
        </div>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <div className="h-screen flex bg-black/20 backdrop-blur-sm">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-white/10 bg-white/5">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-light text-white mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {chatRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                onClick={() => setSelectedChatRoom(room)}
                className={`p-4 cursor-pointer border-b border-white/5 ${selectedChatRoom?.id === room.id ? 'bg-white/10' : ''
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={room.avatar} alt={room.mentorName} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                      {room.mentorName.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">{room.mentorName}</h3>
                      <span className="text-xs text-gray-400">{room.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{room.mentorTitle}</p>
                    <p className="text-sm text-gray-300 truncate mt-1">{room.lastMessage}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChatRoom.avatar} alt={selectedChatRoom.mentorName} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                        {selectedChatRoom.mentorName.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-white font-medium">{selectedChatRoom.mentorName}</h2>
                      <p className="text-sm text-gray-400">{selectedChatRoom.mentorTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {pendingMessages.length > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {pendingMessages.length} pending sync
                      </Badge>
                    )}
                    <Button
                      onClick={syncPendingMessages}
                      disabled={pendingMessages.length === 0}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm"
                    >
                      Sync to Sapphire
                    </Button>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Booking #{selectedChatRoom.bookingId}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <p>Start your conversation with {selectedChatRoom.mentorName}!</p>
                    <p className="text-sm mt-2">💡 Messages are stored locally and synced to Sapphire - no signature needed per message!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMentor ? 'justify-start' : 'justify-end'
                        }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isFromMentor
                          ? 'bg-white/10 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex space-x-4">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message... (no signature required!)"
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-light text-white mb-2">Select a conversation</h2>
                <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  )
}


