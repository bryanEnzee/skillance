"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, Calendar, MessageCircle, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import AISidebar from "@/components/ai-sidebar"
import MyActivitiesButton from "@/components/my-activities-button"
import MainLayout from "@/components/main-layout"

const mentors = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Full-Stack Developer",
    company: "Meta",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 0.002, // ETH - Higher rate for senior developer
    expertise: ["React", "Node.js", "System Design"],
    avatar: "/placeholder.svg?height=64&width=64",
    available: true,
    sessions: 89,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "AI/ML Engineer",
    company: "OpenAI",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 0.003, // ETH - Premium rate for AI specialist
    expertise: ["Python", "TensorFlow", "Deep Learning"],
    avatar: "/placeholder.svg?height=64&width=64",
    available: true,
    sessions: 156,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    title: "Product Manager",
    company: "Stripe",
    rating: 4.9,
    reviews: 156,
    hourlyRate: 0.001, // ETH - Standard rate
    expertise: ["Product Strategy", "User Research", "Analytics"],
    avatar: "/placeholder.svg?height=64&width=64",
    available: false,
    sessions: 203,
  },
]

export default function MentorPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const highlightMentor = (mentorId: number) => {
    const element = document.getElementById(`mentor-${mentorId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("ring-2", "ring-purple-500/50")
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-purple-500/50")
      }, 3000)
    }
  }

  // Listen for custom events from the AI sidebar
  useEffect(() => {
    const handleMentorHighlight = (event: CustomEvent) => {
      if (event.detail?.mentorId) {
        highlightMentor(event.detail.mentorId)
      }
    }

    window.addEventListener('highlightMentor' as any, handleMentorHighlight as EventListener)

    return () => {
      window.removeEventListener('highlightMentor' as any, handleMentorHighlight as EventListener)
    }
  }, [])

  return (
    <Navigation>
      <MainLayout>
        <div className="p-6 lg:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-extralight mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Expert Mentors
            </span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Connect with industry leaders and accelerate your growth</p>
        </motion.div>

        {/* Search and My Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search mentors by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder-gray-400 h-12 rounded-xl backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
              />
            </div>
            <MyActivitiesButton />
          </div>
        </motion.div>

        {/* Mentor Listings */}
        <div className="space-y-6">
          {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              id={`mentor-${mentor.id}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="transition-all duration-300 rounded-xl"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6 flex-1">
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Avatar className="h-20 w-20 ring-2 ring-purple-500/20">
                          <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                            {mentor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-light text-white group-hover:text-purple-400 transition-colors duration-300">
                            {mentor.name}
                          </h3>
                          {mentor.available && (
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-light">
                                Available
                              </Badge>
                            </motion.div>
                          )}
                        </div>

                        <p className="text-gray-300 mb-1 font-light">{mentor.title}</p>
                        <p className="text-gray-400 mb-4 font-light">{mentor.company}</p>

                        <div className="flex items-center space-x-6 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{mentor.rating}</span>
                            <span className="text-gray-400">({mentor.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="text-white font-medium">{mentor.hourlyRate} ETH/hour</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-purple-400" />
                            <span className="text-gray-400">{mentor.sessions} sessions</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="bg-purple-500/10 text-purple-300 border-purple-500/20 font-light hover:bg-purple-500/20 transition-colors duration-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 ml-6">
                      <Link href={`/mentor/${mentor.id}/book`}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 border-0 backdrop-blur-sm text-white font-light min-w-[140px]"
                            disabled={!mentor.available}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Session
                          </Button>
                        </motion.div>
                      </Link>

                      <Link href={`/chat`}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light min-w-[140px]"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      </MainLayout>
      {/* AI Sidebar */}
      <AISidebar />
    </Navigation>
  )
}
