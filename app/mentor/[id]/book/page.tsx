"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, DollarSign, ArrowLeft, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"

const timeSlots = [
  { time: "9:00 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "11:00 AM", available: true },
  { time: "2:00 PM", available: true },
  { time: "3:00 PM", available: false },
  { time: "4:00 PM", available: true },
]

const dates = [
  { date: "2024-02-15", day: "Thu", available: 6 },
  { date: "2024-02-16", day: "Fri", available: 4 },
  { date: "2024-02-17", day: "Sat", available: 0 },
  { date: "2024-02-18", day: "Sun", available: 0 },
  { date: "2024-02-19", day: "Mon", available: 5 },
  { date: "2024-02-20", day: "Tue", available: 3 },
]

export default function BookMentorPage() {
  const [selectedDate, setSelectedDate] = useState("2024-02-15")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)

  const handleBooking = async () => {
    setIsBooking(true)
    // Simulate booking process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsBooking(false)
    setIsBooked(true)
  }

  if (isBooked) {
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
                <h2 className="text-2xl font-light text-white mb-2">Booking Confirmed!</h2>
                <p className="text-gray-300 mb-6 font-light">
                  Your session with Sarah Chen is scheduled for {selectedDate} at {selectedTime}
                </p>
                <div className="space-y-3">
                  <Link href="/mentor">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 font-light">
                        Back to Mentors
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/mentor/1/chat">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light"
                      >
                        Start Chat
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
            <Link href="/mentor">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Mentors
                </Button>
              </motion.div>
            </Link>
          </div>
          <h1 className="text-5xl font-extralight mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Book Session
            </span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Schedule your mentorship session</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentor Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-purple-500/20">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Sarah Chen" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                      SC
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-light text-white">Sarah Chen</h3>
                    <p className="text-gray-300 font-light">Senior Full-Stack Developer</p>
                    <p className="text-gray-400 font-light">Meta</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">4.9</span>
                    <span className="text-gray-400 font-light">(127 reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">$150/hour</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300 font-light">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Node.js", "System Design"].map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-light"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Interface */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white font-light text-2xl">
                  <Calendar className="h-6 w-6 text-purple-400" />
                  <span>Select Date & Time</span>
                </CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Choose your preferred session date and time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-light text-white mb-4">Available Dates</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {dates.map((date, index) => (
                      <motion.button
                        key={date.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date.date)}
                        disabled={date.available === 0}
                        className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                          selectedDate === date.date
                            ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-purple-500 text-white"
                            : date.available > 0
                              ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                              : "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-sm font-medium">{date.day}</div>
                        <div className="text-xs">{new Date(date.date).getDate()}</div>
                        <div className="text-xs mt-1">{date.available > 0 ? `${date.available} slots` : "Full"}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-light text-white mb-4">Available Times</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {timeSlots.map((slot, index) => (
                      <motion.button
                        key={slot.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: slot.available ? 1.05 : 1 }}
                        whileTap={{ scale: slot.available ? 0.95 : 1 }}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                          selectedTime === slot.time
                            ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-purple-500 text-white"
                            : slot.available
                              ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                              : "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-medium">{slot.time}</div>
                        {!slot.available && <div className="text-xs">Booked</div>}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <h4 className="text-white font-light text-lg mb-4">Session Summary</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-light">Date:</span>
                            <span className="text-white">{new Date(selectedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-light">Time:</span>
                            <span className="text-white">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-light">Duration:</span>
                            <span className="text-white">1 hour</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-white/10">
                            <span className="text-gray-300">Total:</span>
                            <span className="text-green-400 text-lg">$150</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Book Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || isBooking}
                    className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white font-light py-4 text-lg"
                  >
                    {isBooking ? (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      "Book & Pay $150"
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Navigation>
  )
}
