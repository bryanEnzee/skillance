"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Clock, 
  DollarSign, 
  Star, 
  MessageCircle, 
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Target,
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import Link from "next/link"

// Mock user data - in production this would come from your smart contracts and user profile
const MOCK_USER_DATA = {
  address: "0x742d35Cc6C4C4532CE25ABd971E78DdB6C4C4532",
  name: "John Developer",
  joinDate: "2024-01-15",
  totalSpent: 0.45, // ETH
  totalSpentUSD: 1125,
  totalSessions: 12,
  averageRating: 4.7,
  favoriteCategories: ["React Development", "Blockchain Development", "UI/UX Design"],
  learningStreak: 15, // days
  completedGoals: 8,
  totalGoals: 12
}

const MOCK_BOOKINGS = [
  {
    id: 1001,
    mentorName: "Alice Johnson",
    mentorAvatar: "/placeholder.svg?height=40&width=40",
    expertise: "React Development",
    date: "2024-12-15",
    time: "2:00 PM - 3:00 PM",
    status: "completed",
    rating: 5,
    cost: 0.05,
    costUSD: 125,
    topic: "React Performance Optimization",
    hasReview: true,
    chatRoomId: 1
  },
  {
    id: 1002,
    mentorName: "Bob Smith", 
    mentorAvatar: "/placeholder.svg?height=40&width=40",
    expertise: "Blockchain Development",
    date: "2024-12-18",
    time: "3:00 PM - 4:00 PM",
    status: "upcoming",
    cost: 0.075,
    costUSD: 188,
    topic: "Smart Contract Security",
    hasReview: false,
    chatRoomId: 2
  },
  {
    id: 1003,
    mentorName: "Carol Davis",
    mentorAvatar: "/placeholder.svg?height=40&width=40", 
    expertise: "UI/UX Design",
    date: "2024-12-20",
    time: "1:00 PM - 2:00 PM",
    status: "upcoming",
    cost: 0.04,
    costUSD: 100,
    topic: "Design System Architecture",
    hasReview: false,
    chatRoomId: 3
  },
  {
    id: 1004,
    mentorName: "Alice Johnson",
    mentorAvatar: "/placeholder.svg?height=40&width=40",
    expertise: "React Development", 
    date: "2024-12-10",
    time: "4:00 PM - 5:00 PM",
    status: "completed",
    rating: 4,
    cost: 0.05,
    costUSD: 125,
    topic: "Next.js App Router",
    hasReview: true,
    chatRoomId: 4
  }
]

const MOCK_LEARNING_GOALS = [
  {
    id: 1,
    title: "Master React Hooks",
    description: "Learn useState, useEffect, useContext, and custom hooks",
    progress: 85,
    completed: false,
    dueDate: "2024-12-31",
    category: "React Development"
  },
  {
    id: 2,
    title: "Build a DeFi Protocol",
    description: "Create a complete DeFi lending protocol with smart contracts",
    progress: 60,
    completed: false,
    dueDate: "2025-01-15",
    category: "Blockchain Development"
  },
  {
    id: 3,
    title: "Design System Mastery",
    description: "Create and maintain a scalable design system",
    progress: 100,
    completed: true,
    dueDate: "2024-12-01",
    category: "UI/UX Design"
  }
]

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [upcomingSessions, setUpcomingSessions] = useState(
    MOCK_BOOKINGS.filter(booking => booking.status === "upcoming")
  )
  const [pastSessions, setPastSessions] = useState(
    MOCK_BOOKINGS.filter(booking => booking.status === "completed")
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "upcoming":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Navigation>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {MOCK_USER_DATA.name}!</h1>
                <p className="text-gray-600 mt-1">
                  Member since {new Date(MOCK_USER_DATA.joinDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Learning Streak</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-600">{MOCK_USER_DATA.learningStreak}</span>
                  <span className="text-gray-600">days 🔥</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{MOCK_USER_DATA.totalSessions}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${MOCK_USER_DATA.totalSpentUSD}</p>
                    <p className="text-xs text-gray-500">{MOCK_USER_DATA.totalSpent} ETH</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-2xl font-bold text-gray-900">{MOCK_USER_DATA.averageRating}</p>
                      <div className="flex">
                        {renderStars(Math.floor(MOCK_USER_DATA.averageRating))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Goals Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {MOCK_USER_DATA.completedGoals}/{MOCK_USER_DATA.totalGoals}
                    </p>
                    <Progress 
                      value={(MOCK_USER_DATA.completedGoals / MOCK_USER_DATA.totalGoals) * 100} 
                      className="mt-2 h-2"
                    />
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">My Sessions</TabsTrigger>
              <TabsTrigger value="goals">Learning Goals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={session.mentorAvatar} />
                                <AvatarFallback>
                                  {session.mentorName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{session.mentorName}</p>
                                <p className="text-sm text-gray-600">{session.date} • {session.time}</p>
                                <p className="text-xs text-gray-500">{session.topic}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${session.costUSD}</p>
                              <Link href={`/chat?room=${session.chatRoomId}`}>
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        <Link href="/mentor/discover">
                          <Button className="w-full">
                            Book New Session
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No upcoming sessions</p>
                        <Link href="/mentor/discover">
                          <Button>Browse Mentors</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MOCK_LEARNING_GOALS.slice(0, 3).map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{goal.title}</p>
                            <Badge variant={goal.completed ? "default" : "secondary"}>
                              {goal.progress}%
                            </Badge>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        View All Goals
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/mentor/discover">
                      <Button className="w-full h-20 flex-col gap-2">
                        <Users className="h-6 w-6" />
                        Find Mentors
                      </Button>
                    </Link>
                    <Link href="/chat">
                      <Button variant="outline" className="w-full h-20 flex-col gap-2">
                        <MessageCircle className="h-6 w-6" />
                        My Chats
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-20 flex-col gap-2">
                      <Award className="h-6 w-6" />
                      Achievements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions ({upcomingSessions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={session.mentorAvatar} />
                                <AvatarFallback>
                                  {session.mentorName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{session.mentorName}</p>
                                <Badge variant="secondary">{session.expertise}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                              {getStatusIcon(session.status)}
                              <span className="text-sm capitalize">{session.status}</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Topic:</strong> {session.topic}</p>
                            <p><strong>Date:</strong> {session.date}</p>
                            <p><strong>Time:</strong> {session.time}</p>
                            <p><strong>Cost:</strong> ${session.costUSD} ({session.cost} ETH)</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Link href={`/chat?room=${session.chatRoomId}`}>
                              <Button size="sm">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Past Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Past Sessions ({pastSessions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pastSessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={session.mentorAvatar} />
                                <AvatarFallback>
                                  {session.mentorName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{session.mentorName}</p>
                                <Badge variant="secondary">{session.expertise}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              {getStatusIcon(session.status)}
                              <span className="text-sm capitalize">{session.status}</span>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Topic:</strong> {session.topic}</p>
                            <p><strong>Date:</strong> {session.date}</p>
                            <div className="flex items-center gap-2">
                              <strong>Your Rating:</strong>
                              <div className="flex">
                                {renderStars(session.rating || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Link href={`/chat?room=${session.chatRoomId}`}>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                View Chat
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              Book Again
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Learning Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learning Goals</h2>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Add New Goal
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_LEARNING_GOALS.map((goal) => (
                  <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </div>
                      <Badge variant="secondary">{goal.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <p className="text-xs text-gray-500">
                          Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        {goal.completed ? "View Details" : "Continue Learning"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Monthly Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">$450</p>
                      <p className="text-sm text-gray-600">This month</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+12% from last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Learning Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">8</p>
                      <p className="text-sm text-gray-600">Sessions this month</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+3 from last month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {MOCK_USER_DATA.favoriteCategories.map((category, index) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Learning Journey */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Learning Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">First Session Completed</p>
                        <p className="text-sm text-gray-600">Started your learning journey</p>
                      </div>
                      <Badge>Jan 2024</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">10 Sessions Milestone</p>
                        <p className="text-sm text-gray-600">Consistent learner achievement</p>
                      </div>
                      <Badge>Nov 2024</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">First 5-Star Review</p>
                        <p className="text-sm text-gray-600">Excellent session feedback</p>
                      </div>
                      <Badge>Dec 2024</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Navigation>
  )
}
