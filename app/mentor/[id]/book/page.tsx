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
import { MENTOR_BOOKING_ESCROW_ADDRESS, MENTOR_BOOKING_ESCROW_ABI, MENTOR_WALLET_ADDRESS, CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI } from "@/lib/contract"

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
    walletAddress: "0x971360600908069c9F5d33B7cFA4A760C0Ec5a21", // Marcus's wallet
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
    walletAddress: "0x971360600908069c9F5d33B7cFA4A760C0Ec5a21", // Elena's wallet
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
  const [mentor, setMentor] = useState<any>(null);
  const [isLoadingMentor, setIsLoadingMentor] = useState(true);
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load mentor data from contract
  useEffect(() => {
    const loadMentor = async () => {
      try {
        if (!window.ethereum) {
          setError("Please install MetaMask to view mentor details");
          setIsLoadingMentor(false);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI, provider);

        console.log("Loading mentor with ID:", mentorId);
        const mentorData = await contract.getMentor(mentorId);
        
        const loadedMentor = {
          id: mentorId,
          name: mentorData.name,
          expertiseArea: mentorData.expertiseArea,
          bio: mentorData.bio,
          hourlyRate: parseFloat(ethers.utils.formatEther(mentorData.hourlyRate)),
          portfolioUrl: mentorData.portfolioUrl,
          yearsExperience: mentorData.yearsExperience.toNumber(),
          skills: mentorData.skills,
          languages: mentorData.languages,
          isVerified: mentorData.isVerified,
          isActive: mentorData.isActive,
          totalSessions: mentorData.totalSessions.toNumber(),
          averageRating: mentorData.averageRating.toNumber() / 100,
          available: mentorData.isActive,
          // Default schedule for now - can be enhanced later
          schedule: {
            availableDates: [
              { date: "2024-02-15", day: "Thu", available: 4 },
              { date: "2024-02-16", day: "Fri", available: 2 },
              { date: "2024-02-19", day: "Mon", available: 3 },
              { date: "2024-02-20", day: "Tue", available: 1 },
            ],
            timeSlots: [
              { time: "9:00 AM", available: true },
              { time: "11:00 AM", available: true },
              { time: "2:00 PM", available: true },
              { time: "4:00 PM", available: true },
            ]
          }
        };

        setMentor(loadedMentor);

        // Set default selected date to first available date
        const firstAvailable = loadedMentor.schedule.availableDates.find(date => date.available > 0);
        if (firstAvailable) {
          setSelectedDate(firstAvailable.date);
        }

      } catch (error) {
        console.error("Error loading mentor:", error);
        setError("Failed to load mentor details. Please try again.");
      } finally {
        setIsLoadingMentor(false);
      }
    };

    if (mentorId) {
      loadMentor();
    }
  }, [mentorId]);

  const handleBooking = async () => {
    console.log('=== BOOKING PROCESS START ===');
    console.log('Selected date:', selectedDate);
    console.log('Selected time:', selectedTime);
    console.log('Mentor:', mentor.name, 'ID:', mentor.id);
    console.log('CHAT_STORAGE_ADDRESS:', CHAT_STORAGE_ADDRESS);
    console.log('MENTOR_BOOKING_ESCROW_ADDRESS:', MENTOR_BOOKING_ESCROW_ADDRESS);

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time')
      return
    }

    setIsBooking(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      console.log('Requesting account access...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      console.log('User address:', userAddress);

      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create contract instance
      if (!MENTOR_BOOKING_ESCROW_ADDRESS) {
        throw new Error('Mentor booking contract address not configured');
      }

      const contract = new ethers.Contract(
        MENTOR_BOOKING_ESCROW_ADDRESS,
        MENTOR_BOOKING_ESCROW_ABI,
        signer
      );

      // Convert date to timestamp
      const dateTimestamp = Math.floor(new Date(selectedDate).getTime() / 1000);

      // Use the mentor's rate from frontend data
      const mentorRate = ethers.utils.parseEther(mentor.hourlyRate.toString());
      console.log('Using mentor rate:', mentor.hourlyRate, 'ETH');

      // Call the contract with mentor ID
      const tx = await contract.bookSession(
        mentor.id,
        dateTimestamp,
        selectedTime,
        {
          value: mentorRate,
          gasLimit: 300000
        });

      // Wait for transaction to be mined
      console.log('Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      console.log('Receipt events:', receipt.events);

      // Get the booking ID from the event
      const bookedEvent = receipt.events?.find((event: any) => event.event === 'Booked');
      console.log('Found Booked event:', bookedEvent);

      let newBookingId = null;

      if (bookedEvent && bookedEvent.args) {
        console.log('Event args:', bookedEvent.args);
        newBookingId = bookedEvent.args.bookingId.toNumber();
        console.log('Extracted booking ID:', newBookingId);
        setBookingId(newBookingId);
      } else {
        console.log('No Booked event found or no args. Trying alternative extraction...');
        console.log('Receipt logs length:', receipt.logs ? receipt.logs.length : 'no logs');

        // Alternative: try to get booking ID from logs
        if (receipt.logs && receipt.logs.length > 0) {
          console.log('Transaction logs:', receipt.logs);
          // Try to parse the first log which should be the Booked event
          try {
            const iface = new ethers.utils.Interface(MENTOR_BOOKING_ESCROW_ABI);
            for (const log of receipt.logs) {
              console.log('Processing log:', log);
              try {
                const parsedLog = iface.parseLog(log);
                console.log('Parsed log:', parsedLog);
                if (parsedLog.name === 'Booked') {
                  newBookingId = parsedLog.args.bookingId.toNumber();
                  console.log('Extracted booking ID from logs:', newBookingId);
                  setBookingId(newBookingId);
                  break;
                }
              } catch (parseError) {
                console.log('Failed to parse log:', parseError);
              }
            }
          } catch (error) {
            console.log('Error parsing logs:', error);
          }
        } else {
          console.log('No logs found in receipt. Using bookingCount as fallback...');
          // Fallback: use the current booking count from the contract
          try {
            console.log('Contract address:', contract.address);
            console.log('Current network:', await provider.getNetwork());

            const currentBookingCount = await contract.bookingCount();
            newBookingId = currentBookingCount.toNumber();
            console.log('Using booking count as ID:', newBookingId);
            setBookingId(newBookingId);
          } catch (fallbackError) {
            console.log('Fallback method failed:', fallbackError);

            // Final fallback: just use a timestamp-based ID
            console.log('Using timestamp-based fallback ID...');
            newBookingId = Date.now() % 1000000; // Use last 6 digits of timestamp
            console.log('Generated fallback booking ID:', newBookingId);
            setBookingId(newBookingId);
          }
        }
      }

      // Create chatroom on Sapphire after successful booking
      if (newBookingId && CHAT_STORAGE_ADDRESS) {
        try {
          console.log('=== CHATROOM CREATION START ===');
          console.log('Booking ID:', newBookingId);
          console.log('User address:', userAddress);
          console.log('Mentor ID:', mentor.id);
          console.log('Chat storage address:', CHAT_STORAGE_ADDRESS);

          // Switch to Sapphire network for chatroom creation
          console.log('Switching to Sapphire network...');
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x5aff' }], // Sapphire Testnet
          });
          console.log('Successfully switched to Sapphire');

          const sapphireProvider = new ethers.providers.Web3Provider(window.ethereum);
          const sapphireSigner = sapphireProvider.getSigner();
          const signerAddress = await sapphireSigner.getAddress();
          console.log('Signer address on Sapphire:', signerAddress);

          const chatContract = new ethers.Contract(CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, sapphireSigner);
          console.log('Chat contract created');

          console.log('Creating chatroom with params:', {
            bookingId: newBookingId,
            userAddress: userAddress,
            mentorId: mentor.id
          });
          
          const chatTx = await chatContract.createChatRoom(newBookingId, userAddress, mentor.id);
          console.log('Transaction sent:', chatTx.hash);

          const chatReceipt = await chatTx.wait();
          console.log('Transaction confirmed:', chatReceipt.transactionHash);
          console.log('=== CHATROOM CREATION SUCCESS ===');
        } catch (chatError: any) {
          console.error('=== CHATROOM CREATION FAILED ===');
          console.error('Error details:', chatError);
          console.error('Error message:', chatError?.message);
          console.error('Error code:', chatError?.code);
          // Don't fail the booking if chatroom creation fails
        }
      } else {
        console.log('Skipping chatroom creation:', {
          hasBookingId: !!newBookingId,
          hasChatAddress: !!CHAT_STORAGE_ADDRESS
        });
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
                  <Link href="/chat">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light"
                      >
                        Go to Chat
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

  // Loading state
  if (isLoadingMentor) {
    return (
      <Navigation>
        <div className="p-6 lg:p-12 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-light text-white mb-2">Loading Mentor Details...</h2>
              <p className="text-gray-400 font-light">Please wait while we fetch the mentor information.</p>
            </CardContent>
          </Card>
        </div>
      </Navigation>
    )
  }

  // Error state
  if (error || !mentor) {
    return (
      <Navigation>
        <div className="p-6 lg:p-12 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-white/5 border-red-500/30 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-light text-white mb-2">Error Loading Mentor</h2>
              <p className="text-gray-400 font-light mb-6">{error || "Mentor not found"}</p>
              <Link href="/mentor">
                <Button className="w-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 font-light">
                  Back to Mentors
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                    <span className="text-white font-medium">{mentor.rating || mentor.averageRating || 'New'}</span>
                    <span className="text-gray-400 font-light">({mentor.reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">{mentor.hourlyRate} ETH/hour</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-300 font-light">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {(mentor.skills || mentor.expertise || []).map((skill) => (
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
