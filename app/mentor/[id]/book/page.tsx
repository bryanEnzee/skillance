"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, DollarSign, ArrowLeft, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import { useRouter, useParams } from "next/navigation"
import { ethers } from "ethers"
import { MENTOR_BOOKING_ESCROW_ADDRESS, MENTOR_BOOKING_ESCROW_ABI, MENTOR_WALLET_ADDRESS } from "@/lib/contract"

// Dynamic mentors with individual schedules and pricing
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
    walletAddress: "0x971360600908069c9F5d33B7cFA4A760C0Ec5a21", // Sarah's wallet
    schedule: {
      availableDates: [
        { date: "2024-02-15", day: "Thu", available: 4 },
        { date: "2024-02-16", day: "Fri", available: 2 },
        { date: "2024-02-17", day: "Sat", available: 0 },
        { date: "2024-02-18", day: "Sun", available: 0 },
        { date: "2024-02-19", day: "Mon", available: 3 },
        { date: "2024-02-20", day: "Tue", available: 1 },
      ],
      timeSlots: [
        { time: "9:00 AM", available: true },
        { time: "10:00 AM", available: false },
        { time: "11:00 AM", available: true },
        { time: "2:00 PM", available: true },
        { time: "3:00 PM", available: false },
        { time: "4:00 PM", available: true },
      ]
    }
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
    walletAddress: "0x1234567890123456789012345678901234567890", // Marcus's wallet
    schedule: {
      availableDates: [
        { date: "2024-02-15", day: "Thu", available: 2 },
        { date: "2024-02-16", day: "Fri", available: 0 },
        { date: "2024-02-17", day: "Sat", available: 1 },
        { date: "2024-02-18", day: "Sun", available: 0 },
        { date: "2024-02-19", day: "Mon", available: 4 },
        { date: "2024-02-20", day: "Tue", available: 2 },
      ],
      timeSlots: [
        { time: "10:00 AM", available: true },
        { time: "11:00 AM", available: false },
        { time: "12:00 PM", available: true },
        { time: "1:00 PM", available: true },
        { time: "2:00 PM", available: false },
        { time: "3:00 PM", available: true },
      ]
    }
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
    walletAddress: "0x9876543210987654321098765432109876543210", // Elena's wallet
    schedule: {
      availableDates: [
        { date: "2024-02-15", day: "Thu", available: 0 },
        { date: "2024-02-16", day: "Fri", available: 0 },
        { date: "2024-02-17", day: "Sat", available: 0 },
        { date: "2024-02-18", day: "Sun", available: 0 },
        { date: "2024-02-19", day: "Mon", available: 0 },
        { date: "2024-02-20", day: "Tue", available: 0 },
      ],
      timeSlots: [
        { time: "9:00 AM", available: false },
        { time: "10:00 AM", available: false },
        { time: "11:00 AM", available: false },
        { time: "2:00 PM", available: false },
        { time: "3:00 PM", available: false },
        { time: "4:00 PM", available: false },
      ]
    }
  },
]

export default function BookMentorPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = Number(params?.id);
  const mentor = mentors.find((m) => m.id === mentorId) || mentors[0];
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Set default selected date to first available date
  useEffect(() => {
    if (mentor && mentor.schedule.availableDates.length > 0) {
      const firstAvailable = mentor.schedule.availableDates.find(date => date.available > 0);
      if (firstAvailable) {
        setSelectedDate(firstAvailable.date);
      }
    }
  }, [mentor]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsBooking(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        MENTOR_BOOKING_ESCROW_ADDRESS,
        MENTOR_BOOKING_ESCROW_ABI,
        signer
      );

      // Convert date to timestamp
      const dateTimestamp = Math.floor(new Date(selectedDate).getTime() / 1000);

      // Use mentor's specific wallet address
      const mentorAddress = mentor.walletAddress;

      // Get the mentor's rate from the contract
      let mentorRate;
      try {
        // Try to get the rate from the contract
        try {
          mentorRate = await contract.getMentorRate(mentorAddress);
          console.log('Mentor rate from contract:', ethers.utils.formatEther(mentorRate), 'ETH');
          
          if (mentorRate.isZero()) {
            console.log('Mentor rate is zero, using default rate');
            // If rate is zero, use the frontend rate but convert to wei
            mentorRate = ethers.utils.parseEther(mentor.hourlyRate.toString());
          }
        } catch (e) {
          console.warn('Could not get mentor rate, using frontend rate', e);
          // Fallback to the frontend rate if contract call fails
          mentorRate = ethers.utils.parseEther(mentor.hourlyRate.toString());
        }

        // Show the actual rate being used
        const rateInEth = parseFloat(ethers.utils.formatEther(mentorRate));
        console.log('Using rate:', rateInEth, 'ETH');
        
      } catch (error) {
        console.error('Error getting mentor rate:', error);
        // Use frontend rate as last resort
        mentorRate = ethers.utils.parseEther(mentor.hourlyRate.toString());
      }

      // Call the contract with the determined rate
      const tx = await contract.bookSession(
        mentorAddress,
        dateTimestamp,
        selectedTime,
        { 
          value: mentorRate,
          gasLimit: 300000 
        });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Get the booking ID from the event
      const bookedEvent = receipt.events?.find((event: any) => event.event === 'Booked');

      if (bookedEvent && bookedEvent.args) {
        setBookingId(bookedEvent.args.bookingId.toNumber());
      }

      setIsBooked(true);
    } catch (err: any) {
      console.error('Booking error:', err);

      // Handle specific error cases
      if (err.code === 4001 || err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected')) {
        setError('Transaction was cancelled. Please try again when you\'re ready to book.');
      } else if (err.message?.includes('Incorrect ETH amount')) {
        setError('The mentor\'s rate has changed. Please refresh the page and try again.');
      } else if (err.message?.includes('Mentor not registered')) {
        setError('This mentor is not registered in the booking system.');
      } else {
        setError(err.message || 'Failed to book session. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
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
                  Your session with {mentor.name} is scheduled for {selectedDate} at {selectedTime}
                  {bookingId && (
                    <span className="block mt-2 text-sm text-purple-400">
                      Booking ID: {bookingId}
                    </span>
                  )}
                </p>
                <div className="space-y-3">
                  <Link href="/mentor">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 font-light">
                        Back to Mentors
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href={`/mentor/${mentor.id}/chat`}>
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
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white">
                      {mentor.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-light text-white">{mentor.name}</h3>
                    <p className="text-gray-300 font-light">{mentor.title}</p>
                    <p className="text-gray-400 font-light">{mentor.company}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{mentor.rating}</span>
                    <span className="text-gray-400 font-light">({mentor.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">{mentor.hourlyRate} ETH/hour</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300 font-light">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
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
                    {mentor.schedule.availableDates.map((date, index) => (
                      <motion.button
                        key={date.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date.date)}
                        disabled={date.available === 0}
                        className={`p-3 rounded-xl border text-center transition-all duration-300 ${selectedDate === date.date
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
                    {mentor.schedule.timeSlots.map((slot, index) => (
                      <motion.button
                        key={slot.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: slot.available ? 1.05 : 1 }}
                        whileTap={{ scale: slot.available ? 0.95 : 1 }}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-4 rounded-xl border text-center transition-all duration-300 ${selectedTime === slot.time
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
                            <span className="text-green-400 text-lg">{mentor.hourlyRate} ETH</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Book Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || isBooking || !mentor.available}
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
                      `Book & Pay ${mentor.hourlyRate} ETH`
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
