"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import { ethers } from "ethers"
// import { SESSION_CHAT_ADDRESS, SESSION_CHAT_ABI } from "@/lib/contract"
import { ExternalLink, MessageCircle, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface SessionRoom {
  id: number
  bookingId: number
  mentorName: string
  mentorTitle: string
  avatar: string
  lastMessage: string
  timestamp: string
  isActive: boolean
}

export default function SessionChatPage() {
  const [sessions, setSessions] = useState<SessionRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [blockchainStatus, setBlockchainStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [contractAddress, setContractAddress] = useState<string>('')
  const router = useRouter()

  // // Load user sessions
  // useEffect(() => {
  //   loadUserSessions()
  //   verifyBlockchainConnection()
  // }, [])

  // const verifyBlockchainConnection = async () => {
  //   try {
  //     if (!window.ethereum) {
  //       setBlockchainStatus('disconnected')
  //       return
  //     }

  //     setBlockchainStatus('connecting')
  //     const provider = new ethers.providers.Web3Provider(window.ethereum)
  //     const network = await provider.getNetwork()
      
  //     // Check if connected to Sapphire Testnet
  //     if (network.chainId === 0x5aff) {
  //       setBlockchainStatus('connected')
  //       setContractAddress(SESSION_CHAT_ADDRESS || '')
        
  //       // Get contract info to prove it exists
  //       const contract = new ethers.Contract(SESSION_CHAT_ADDRESS!, SESSION_CHAT_ABI, provider)
  //       const code = await provider.getCode(SESSION_CHAT_ADDRESS!)
        
  //       if (code !== '0x') {
  //         console.log('✅ Session contract verified on Sapphire:', SESSION_CHAT_ADDRESS)
  //         console.log('🌐 Network:', network.name, 'Chain ID:', network.chainId)
  //       }
  //     } else {
  //       setBlockchainStatus('disconnected')
  //       console.log('❌ Not connected to Sapphire Testnet')
  //     }
  //   } catch (error) {
  //     console.error('Blockchain verification error:', error)
  //     setBlockchainStatus('disconnected')
  //   }
  // }

  const loadUserSessions = async () => {
    try {
      setLoading(true)
      
      // For demo purposes, show mock sessions
      // In production, you'd query the SessionChatStorage contract for user's sessions
      const mockSessions: SessionRoom[] = [
        {
          id: 1,
          bookingId: 1,
          mentorName: "Dr. Sarah Chen",
          mentorTitle: "Senior Blockchain Developer",
          avatar: "/placeholder-user.jpg",
          lastMessage: "Session ready - chat with zero signatures!",
          timestamp: "2 min ago",
          isActive: true
        },
        {
          id: 2,
          bookingId: 2,
          mentorName: "Alex Rodriguez",
          mentorTitle: "DeFi Protocol Expert",
          avatar: "/placeholder-user.jpg",
          lastMessage: "Ready to discuss smart contract security",
          timestamp: "5 min ago",
          isActive: true
        }
      ]
      
      setSessions(mockSessions)
      console.log('✅ Sessions loaded:', mockSessions.length)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSessionChat = (session: SessionRoom) => {
    // Navigate to the session-based chat component
    router.push(`/chat/session/${session.bookingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation><div></div></Navigation>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your chat sessions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation>
        <div></div>
      </Navigation>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Session-Based Chat</h1>
          <p className="text-xl text-gray-600">Signature-free messaging with blockchain proof</p>
        </motion.div>

        {/* Blockchain Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    blockchainStatus === 'connected' ? 'bg-green-500' : 
                    blockchainStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm">
                    {blockchainStatus === 'connected' ? 'Connected to Sapphire' : 
                     blockchainStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
                
                {contractAddress && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <a 
                      href={`https://explorer.sapphire.oasis.io/address/${contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Session Contract <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Zero Signatures During Chat</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session List */}
        <div className="grid gap-4">
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
                  <p className="text-gray-600 mb-4">Book a mentor session to start chatting</p>
                  <Button onClick={() => router.push('/mentor')}>
                    Browse Mentors
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startSessionChat(session)}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.avatar} alt={session.mentorName} />
                        <AvatarFallback>{session.mentorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{session.mentorName}</h3>
                          {session.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Active Session
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{session.mentorTitle}</p>
                        <p className="text-sm text-gray-800">{session.lastMessage}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-2">{session.timestamp}</p>
                        <Button size="sm">
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
