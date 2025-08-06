"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Briefcase,
  Star,
  DollarSign,
  MessageCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAddress } from "@thirdweb-dev/react"
const myMentors = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Full-Stack Developer",
    company: "Meta",
    avatar: "/placeholder.svg?height=48&width=48",
    rating: 4.9,
    sessionsCompleted: 3,
    nextSession: "Tomorrow, 2:00 PM",
    totalSpent: 450,
    canReview: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "AI/ML Engineer",
    company: "OpenAI",
    avatar: "/placeholder.svg?height=48&width=48",
    rating: 4.8,
    sessionsCompleted: 2,
    nextSession: "Friday, 10:00 AM",
    totalSpent: 400,
    canReview: false,
  },
]

const myJobs = [
  {
    id: 1,
    title: "React E-commerce Platform",
    client: "TechStart Inc.",
    status: "In Progress",
    progress: 75,
    budget: "$4,500",
    deadline: "March 15, 2024",
    stakeAmount: 100,
    canReview: false,
  },
  {
    id: 2,
    title: "Mobile App UI Design",
    client: "Creative Studio",
    status: "Completed",
    progress: 100,
    budget: "$2,800",
    deadline: "Completed",
    stakeAmount: 75,
    canReview: true,
  },
]

export default function MyActivitiesButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light"
          >
            My Activities
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-black/90 border-white/10 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            My Activities
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="mentors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border-white/10">
            <TabsTrigger value="mentors" className="data-[state=active]:bg-white/10">
              <Users className="h-4 w-4 mr-2" />
              My Mentors
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-white/10">
              <Briefcase className="h-4 w-4 mr-2" />
              My Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="space-y-4 mt-6">
            {myMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    {/* Mentor Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={mentor.avatar || "/placeholder.svg"}
                            alt={mentor.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                            {mentor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-light text-white">
                            {mentor.name}
                          </h3>
                          <p className="text-gray-300 font-light">
                            {mentor.title}
                          </p>
                          <p className="text-gray-400 text-sm font-light">
                            {mentor.company}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-white font-medium">
                            {mentor.rating}
                          </span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {mentor.sessionsCompleted} sessions
                        </Badge>
                      </div>
                    </div>

                    {/* Mentor Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-gray-400 text-sm font-light">
                          Next Session
                        </p>
                        <p className="text-white text-sm">
                          {mentor.nextSession}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-light">
                          Total Spent
                        </p>
                        <p className="text-green-400 text-sm font-medium">
                          ${mentor.totalSpent}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/chat`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                      </div>
                      <div>
                        {mentor.canReview && (
                          <ReviewButton
                            mentorId={mentor.id}
                            mentorName={mentor.name}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 mt-6">
            {myJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    {/* Job Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-light text-white">
                          {job.title}
                        </h3>
                        <p className="text-gray-300 font-light">
                          {job.client}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          job.status === "Completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {job.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {job.status === "In Progress" && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400 font-light">
                            Progress
                          </span>
                          <span className="text-white">{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Job Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm font-light">
                          Budget
                        </p>
                        <p className="text-green-400 text-sm font-medium">
                          {job.budget}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-light">
                          Deadline
                        </p>
                        <p className="text-white text-sm">{job.deadline}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-light">
                          Stake
                        </p>
                        <p className="text-yellow-400 text-sm font-medium">
                          ${job.stakeAmount}
                        </p>
                      </div>
                      <div>
                        {job.canReview && (
                          <ReviewButton
                            jobId={job.id}
                            clientName={job.client}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ReviewButton({
  mentorId,
  mentorName,
  jobId,
  clientName,
}: {
  mentorId?: number
  mentorName?: string
  jobId?: number
  clientName?: string
}) {
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  return (
    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500 hover:to-orange-500 font-light"
        >
          <Star className="h-4 w-4 mr-1" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-black/90 border-white/10 backdrop-blur-xl text-white">
        <ReviewForm
          mentorId={mentorId}
          mentorName={mentorName}
          jobId={jobId}
          clientName={clientName}
          onClose={() => setIsReviewOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ReviewForm({
  mentorId,
  mentorName,
  jobId,
  clientName,
  onClose,
}: {
  mentorId?: number
  mentorName?: string
  jobId?: number
  clientName?: string
  onClose: () => void
}) {
  const userAddress = useAddress()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!userAddress) {
      console.error("No connected wallet address")
      return
    }

    setIsSubmitting(true)
    try {
      // 1) Submit review (simulate or replace with actual call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 2) Transfer 0.1 USDC to the user
      const resp = await fetch("/api/transfer-usdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress }),
      })
      const { txHash, error } = await resp.json()
      if (error) throw new Error(error)
      console.log("Sent 0.1 USDC, txHash:", txHash)

      // 3) Show success UI
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error during review or payment:", err)
      // you can show a toast/error banner here
    } finally {
      setIsSubmitting(false)
      // auto-close after 3s
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setRating(0)
        setReview("")
      }, 3000)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-green-400 fill-current" />
          </div>
        </motion.div>
        <h3 className="text-xl font-light text-white mb-2">
          Review Submitted!
        </h3>
        <p className="text-gray-300 font-light mb-4">Thank you for your feedback.</p>
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Reward Earned!</span>
          </div>
          <p className="text-white text-lg font-medium">+0.1 USDC</p>
          <p className="text-gray-400 text-sm font-light">
            Micropayment reward for your review
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-xl font-light">
          Leave a Review for {mentorName || clientName}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        {/* Rating */}
        <div>
          <label className="text-white font-light mb-3 block">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className={`p-1 ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
              >
                <Star className="h-8 w-8 fill-current" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="text-white font-light mb-3 block">Your Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={`Share your experience with ${mentorName || clientName}...`}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300 resize-none"
          />
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            disabled={!rating || !review.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-500 hover:to-orange-500 text-white font-light py-3"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Submitting Review...</span>
              </div>
            ) : (
              "Submit Review & Earn 0.1 USDC"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
