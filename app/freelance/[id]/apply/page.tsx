"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, Clock, Users, Star, CheckCircle, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"

const jobData = {
  id: 1,
  title: "React Developer for E-commerce Platform",
  company: "TechStart Inc.",
  budget: "$3,000 - $5,000",
  duration: "2-3 months",
  posted: "2 hours ago",
  applicants: 12,
  skills: ["React", "TypeScript", "Node.js", "MongoDB"],
  description:
    "We're looking for an experienced React developer to build a modern e-commerce platform with advanced features including user authentication, payment processing, inventory management, and analytics dashboard. The ideal candidate should have strong experience with React ecosystem and modern development practices.",
  stakeRequired: 100,
  rating: 4.8,
}

export default function ApplyJobPage() {
  const [proposal, setProposal] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsApplying(true)
    // Simulate application process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsApplying(false)
    setIsApplied(true)
  }

  if (isApplied) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-light text-white mb-2">Application Submitted!</h2>
                <p className="text-gray-300 mb-4 font-light">
                  Your application has been submitted successfully. Your stake of ${jobData.stakeRequired} has been
                  locked.
                </p>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-light">Staked Amount:</span>
                    <span className="text-yellow-400 font-medium">${jobData.stakeRequired}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-light">
                    Your stake will be returned along with payment upon successful project completion.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link href="/freelance">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 font-light">
                        Browse More Jobs
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/home">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light"
                      >
                        Back to Home
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <div className="p-6 lg:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/freelance">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </motion.div>
            </Link>
          </div>
          <h1 className="text-5xl font-extralight mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Apply for Job
            </span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Submit your proposal with stake commitment</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white font-light mb-2">{jobData.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-base font-light">{jobData.company}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{jobData.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300 font-light leading-relaxed">{jobData.description}</p>

                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">{jobData.budget}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 font-light">{jobData.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300 font-light">{jobData.applicants} applicants</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white font-light text-2xl">Your Proposal</CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Explain why you're the best fit for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="proposal" className="text-white font-light">
                      Cover Letter
                    </Label>
                    <Textarea
                      id="proposal"
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Describe your relevant experience, approach to this project, and why you're the ideal candidate..."
                      rows={8}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isApplying || !proposal.trim()}
                      className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 text-white font-light py-4 text-lg"
                    >
                      {isApplying ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          <span>Processing Application...</span>
                        </div>
                      ) : (
                        `Apply & Stake $${jobData.stakeRequired}`
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stake Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white font-light text-xl">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <span>Stake Commitment</span>
                </CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Quality assurance through stake-based applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-light">Required Stake:</span>
                    <span className="text-yellow-400 font-bold text-xl">${jobData.stakeRequired}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-light">This amount will be locked when you apply</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-light">How it works:</h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    {[
                      "Stake is locked upon application",
                      "Complete the project successfully",
                      "Receive payment + stake return",
                      "Leave review to complete process",
                    ].map((step, index) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="font-light">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm"
                >
                  <p className="text-green-400 text-sm font-light">✓ Stake-based system ensures committed applicants</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Navigation>
  )
}
