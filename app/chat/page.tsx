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
import { CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI } from "@/lib/contract"

const Navigation = dynamic(() => import("@/components/navigation"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">Loading...</div>
})

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
  chatRoomId?: number
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

  useEffect(() => {
    loadUserChatRooms()
  }, [])

  useEffect(() => {
    if (selectedChatRoom) {
      loadLocalMessages(selectedChatRoom.id)
    }
  }, [selectedChatRoom])

  useEffect(() => {
    if (pendingMessages.length === 0) return;

    console.log("⏱ Detected new pending messages:", pendingMessages.length);
    const timer = setTimeout(() => {
      syncPendingMessages();
    }, 2000);

    return () => clearTimeout(timer);
  }, [pendingMessages])

  const loadUserChatRooms = async () => {
    try {
      if (!window.ethereum || !CHAT_STORAGE_ADDRESS) {
        console.log('❌ Missing ethereum or chat storage address')
        return setLoading(false)
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      setUserAddress(address)
      console.log('👛 User address:', address)

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5aff' }], // Sapphire Testnet
        })
        console.log('✅ Switched to Sapphire network')
      } catch (switchError) { 
        console.log('⚠️ Network switch error:', switchError) 
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const network = await provider.getNetwork()
      console.log('🌐 Connected to network:', network.chainId, network.name)
      
      const contract = new ethers.Contract(CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, provider)
      console.log('📋 Contract address:', CHAT_STORAGE_ADDRESS)

      // First, check if the contract exists and has the method
      try {
        const code = await provider.getCode(CHAT_STORAGE_ADDRESS)
        if (code === '0x' || code === '0x0') {
          console.error('❌ No contract code found at address:', CHAT_STORAGE_ADDRESS)
          setChatRooms([])
          return
        }
        console.log('✅ Contract exists with code length:', code.length)
      } catch (codeError) {
        console.error('❌ Error checking contract code:', codeError)
        setChatRooms([])
        return
      }

      // Try to get chat rooms with better error handling
      let chatRoomIds: any[] = []
      try {
        console.log('🔍 Getting chat rooms for user:', address)
        chatRoomIds = await contract.getChatRoomsForUser(address)
        console.log('📊 Found chat room IDs:', chatRoomIds.map((id: any) => id.toNumber()))
      } catch (getRoomsError: any) {
        console.error('❌ Error getting chat rooms:', getRoomsError)
        
        // Check if it's a revert with a reason
        if (getRoomsError.reason) {
          console.log('📝 Revert reason:', getRoomsError.reason)
        }
        
        // Check if it's a CALL_EXCEPTION (method doesn't exist or reverts)
        if (getRoomsError.code === 'CALL_EXCEPTION') {
          console.log('🔧 CALL_EXCEPTION - trying alternative approach...')
          
          // Try to check if user has any chat rooms by checking total count
          try {
            const totalRooms = await contract.chatRoomCount()
            console.log('📊 Total chat rooms in contract:', totalRooms.toNumber())
            
            if (totalRooms.toNumber() === 0) {
              console.log('ℹ️ No chat rooms exist yet')
              setChatRooms([])
              return
            }
            
            // If there are rooms but we can't get user's rooms, show empty state
            console.log('ℹ️ Chat rooms exist but none found for this user')
            setChatRooms([])
            return
            
          } catch (countError) {
            console.error('❌ Error getting chat room count:', countError)
            setChatRooms([])
            return
          }
        }
        
        // For other errors, just set empty and return
        setChatRooms([])
        return
      }

      // If we got chat room IDs, process them
      const rooms: ChatRoom[] = []
      
      // Create MentorRegistry contract instance
      const mentorRegistryContract = new ethers.Contract(MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI, provider)

      for (const roomId of chatRoomIds) {
        try {
          console.log('🏠 Loading chat room:', roomId.toNumber())
          const roomData = await contract.chatRooms(roomId)
          console.log('📄 Room data:', {
            bookingId: roomData.bookingId.toNumber(),
            user: roomData.user,
            mentorId: roomData.mentorId.toNumber(),
            active: roomData.active,
            createdAt: roomData.createdAt.toNumber()
          })
          
          if (roomData.active) {
            let mentor = null
            const mentorId = roomData.mentorId.toNumber()
            
            // Always try to load from MentorRegistry contract first for accuracy
            try {
              console.log('🔍 Loading mentor from MentorRegistry contract, ID:', mentorId)
              const mentorData = await mentorRegistryContract.getMentor(mentorId)
              mentor = {
                id: mentorId,
                name: mentorData.name,
                title: mentorData.expertiseArea,
                avatar: "/placeholder.svg?height=40&width=40"
              }
              console.log('✅ Loaded mentor from contract:', mentor)
            } catch (mentorError) {
              console.log('⚠️ Mentor not found in contract for ID:', mentorId, 'trying static data...')
              
              // Fallback to static data only if contract lookup fails
              mentor = mentors.find(m => m.id === mentorId)
              if (mentor) {
                console.log('✅ Found mentor in static data:', mentor)
              } else {
                console.log('❌ Mentor not found anywhere for ID:', mentorId)
              }
            }
            
            if (mentor) {
              const chatRoom = {
                id: roomId.toNumber(),
                bookingId: roomData.bookingId.toNumber(),
                mentorId: mentorId,
                mentorName: mentor.name,
                mentorTitle: mentor.title,
                avatar: mentor.avatar,
                lastMessage: "Chat room created",
                timestamp: new Date(roomData.createdAt.toNumber() * 1000).toLocaleString()
              }
              rooms.push(chatRoom)
              console.log('✅ Added chatroom:', chatRoom)
            } else {
              console.log('⚠️ Skipping chatroom - mentor not found for ID:', mentorId)
            }
          } else {
            console.log('⚠️ Chat room is inactive:', roomId.toNumber())
          }
        } catch (roomError) {
          console.error('❌ Error loading room', roomId.toNumber(), ':', roomError)
          console.error('Full error details:', roomError)
        }
      }

      console.log('✅ Loaded', rooms.length, 'chat rooms')
      setChatRooms(rooms)
      
    } catch (error) {
      console.error('❌ Error loading chatrooms:', error)
      setChatRooms([])
    } finally {
      setLoading(false)
    }
  }

  const loadLocalMessages = (chatRoomId: number) => {
    try {
      const stored = localStorage.getItem(`chat_messages_${chatRoomId}_${userAddress}`)
      setMessages(stored ? JSON.parse(stored) : [])
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

      const pendingKey = `pending_messages_${userAddress}`
      const pendingExisting = localStorage.getItem(pendingKey)
      const pending = pendingExisting ? JSON.parse(pendingExisting) : []
      const updated = [...pending, { ...message, chatRoomId }]
      localStorage.setItem(pendingKey, JSON.stringify(updated))
      setPendingMessages(updated)
    } catch (error) {
      console.error('Error saving message locally:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom || !userAddress) return
    const newMsg: Message = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: userAddress,
      isFromMentor: false,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMsg])
    saveMessageLocally(newMsg, selectedChatRoom.id)
    setNewMessage("")
    console.log('💬 Message sent instantly! No signature required.')
  }

  const syncPendingMessages = async () => {
    if (!userAddress || pendingMessages.length === 0) return;

    try {
      console.log("🔄 Syncing via API...");

      const res = await fetch('/api/chat-storage/syncMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: pendingMessages })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("🧾 Synced transactions:", data.txs);

        const pendingKey = `pending_messages_${userAddress}`;
        localStorage.removeItem(pendingKey);
        setPendingMessages([]);
        setLastSyncTime(Date.now());
        console.log("✅ Synced to backend without signature!");
      } else {
        const err = await res.json();
        console.error("❌ Sync API failed:", err);
      }
    } catch (error) {
      console.error("❌ Sync request error:", error);
    }
  };



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


