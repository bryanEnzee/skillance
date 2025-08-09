// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Slider } from "@/components/ui/slider"
// import { 
//   Search, 
//   Filter, 
//   Star, 
//   MapPin, 
//   Clock, 
//   DollarSign, 
//   Users, 
//   CheckCircle,
//   Calendar,
//   MessageCircle,
//   Globe,
//   Award,
//   TrendingUp
// } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import Navigation from "@/components/navigation"
// import Link from "next/link"

// // Mock mentor data - in production this would come from your smart contract
// const MOCK_MENTORS = [
//   {
//     id: 1,
//     name: "Alice Johnson",
//     expertiseArea: "React Development",
//     bio: "Senior React developer with 5+ years of experience building scalable web applications. Specialized in performance optimization and modern React patterns.",
//     hourlyRate: 0.05, // ETH
//     hourlyRateUSD: 125, // USD equivalent
//     yearsExperience: 5,
//     skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL"],
//     languages: ["English", "Spanish"],
//     profileImage: "/placeholder.svg?height=80&width=80",
//     isVerified: true,
//     isActive: true,
//     averageRating: 4.8,
//     ratingCount: 23,
//     totalSessions: 156,
//     responseTime: "< 2 hours",
//     availability: "Available",
//     location: "San Francisco, CA",
//     portfolioUrl: "https://github.com/alice-johnson"
//   },
//   {
//     id: 2,
//     name: "Bob Smith",
//     expertiseArea: "Blockchain Development",
//     bio: "Smart contract expert and DeFi protocol architect. Led development of multiple successful DeFi projects with over $50M TVL.",
//     hourlyRate: 0.075, // ETH
//     hourlyRateUSD: 188,
//     yearsExperience: 7,
//     skills: ["Solidity", "DeFi", "Smart Contracts", "Web3", "Ethereum"],
//     languages: ["English", "German"],
//     profileImage: "/placeholder.svg?height=80&width=80",
//     isVerified: true,
//     isActive: true,
//     averageRating: 4.9,
//     ratingCount: 18,
//     totalSessions: 89,
//     responseTime: "< 4 hours",
//     availability: "Busy until Dec 20",
//     location: "Berlin, Germany",
//     portfolioUrl: "https://github.com/bob-smith"
//   },
//   {
//     id: 3,
//     name: "Carol Davis",
//     expertiseArea: "UI/UX Design",
//     bio: "Product designer with expertise in user research, prototyping, and design systems. Worked with Fortune 500 companies and startups.",
//     hourlyRate: 0.04, // ETH
//     hourlyRateUSD: 100,
//     yearsExperience: 6,
//     skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
//     languages: ["English", "French"],
//     profileImage: "/placeholder.svg?height=80&width=80",
//     isVerified: true,
//     isActive: true,
//     averageRating: 4.7,
//     ratingCount: 31,
//     totalSessions: 203,
//     responseTime: "< 1 hour",
//     availability: "Available",
//     location: "Montreal, Canada",
//     portfolioUrl: "https://carol-davis.design"
//   },
//   {
//     id: 4,
//     name: "David Chen",
//     expertiseArea: "Machine Learning",
//     bio: "ML engineer and data scientist specializing in computer vision and NLP. Published researcher with 10+ papers in top-tier conferences.",
//     hourlyRate: 0.08, // ETH
//     hourlyRateUSD: 200,
//     yearsExperience: 8,
//     skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "NLP"],
//     languages: ["English", "Chinese"],
//     profileImage: "/placeholder.svg?height=80&width=80",
//     isVerified: false, // Pending verification
//     isActive: true,
//     averageRating: 4.6,
//     ratingCount: 12,
//     totalSessions: 45,
//     responseTime: "< 6 hours",
//     availability: "Available",
//     location: "Singapore",
//     portfolioUrl: "https://davidchen.ai"
//   }
// ]

// const EXPERTISE_AREAS = [
//   "All Areas",
//   "React Development",
//   "Blockchain Development", 
//   "UI/UX Design",
//   "Full-Stack Development",
//   "Mobile Development",
//   "DevOps & Cloud",
//   "Data Science",
//   "Machine Learning",
//   "Product Management",
//   "Digital Marketing",
//   "Business Strategy",
//   "Cybersecurity"
// ]

// export default function MentorDiscoverPage() {
//   const [mentors, setMentors] = useState(MOCK_MENTORS)
//   const [filteredMentors, setFilteredMentors] = useState(MOCK_MENTORS)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedExpertise, setSelectedExpertise] = useState("All Areas")
//   const [priceRange, setPriceRange] = useState([0, 300])
//   const [minRating, setMinRating] = useState(0)
//   const [verifiedOnly, setVerifiedOnly] = useState(false)
//   const [availableOnly, setAvailableOnly] = useState(false)
//   const [sortBy, setSortBy] = useState("rating")
//   const [showFilters, setShowFilters] = useState(false)

//   // Filter and search logic
//   useEffect(() => {
//     let filtered = mentors.filter(mentor => {
//       // Search query filter
//       const matchesSearch = !searchQuery || 
//         mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         mentor.expertiseArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

//       // Expertise filter
//       const matchesExpertise = selectedExpertise === "All Areas" || 
//         mentor.expertiseArea === selectedExpertise

//       // Price range filter
//       const matchesPrice = mentor.hourlyRateUSD >= priceRange[0] && 
//         mentor.hourlyRateUSD <= priceRange[1]

//       // Rating filter
//       const matchesRating = mentor.averageRating >= minRating

//       // Verification filter
//       const matchesVerification = !verifiedOnly || mentor.isVerified

//       // Availability filter
//       const matchesAvailability = !availableOnly || mentor.availability === "Available"

//       return matchesSearch && matchesExpertise && matchesPrice && 
//              matchesRating && matchesVerification && matchesAvailability
//     })

//     // Sort results
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "rating":
//           return b.averageRating - a.averageRating
//         case "price-low":
//           return a.hourlyRateUSD - b.hourlyRateUSD
//         case "price-high":
//           return b.hourlyRateUSD - a.hourlyRateUSD
//         case "experience":
//           return b.yearsExperience - a.yearsExperience
//         case "sessions":
//           return b.totalSessions - a.totalSessions
//         default:
//           return 0
//       }
//     })

//     setFilteredMentors(filtered)
//   }, [mentors, searchQuery, selectedExpertise, priceRange, minRating, verifiedOnly, availableOnly, sortBy])

//   const resetFilters = () => {
//     setSearchQuery("")
//     setSelectedExpertise("All Areas")
//     setPriceRange([0, 300])
//     setMinRating(0)
//     setVerifiedOnly(false)
//     setAvailableOnly(false)
//     setSortBy("rating")
//   }

//   const renderStars = (rating: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`h-4 w-4 ${
//           i < Math.floor(rating) 
//             ? 'text-yellow-400 fill-current' 
//             : i < rating 
//             ? 'text-yellow-400 fill-current opacity-50'
//             : 'text-gray-300'
//         }`}
//       />
//     ))
//   }

//   return (
//     <Navigation>
//       <div className="min-h-screen py-8">
//         <div className="container mx-auto px-4">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Mentor</h1>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Connect with verified experts in your field. Get personalized guidance and accelerate your learning journey.
//             </p>
//           </div>

//           {/* Search and Filter Bar */}
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
//             <div className="flex flex-col lg:flex-row gap-4 items-center">
//               {/* Search Input */}
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <Input
//                   placeholder="Search by name, expertise, or skills..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               {/* Expertise Filter */}
//               <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
//                 <SelectTrigger className="w-full lg:w-48">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {EXPERTISE_AREAS.map((area) => (
//                     <SelectItem key={area} value={area}>{area}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               {/* Sort By */}
//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger className="w-full lg:w-48">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="rating">Highest Rated</SelectItem>
//                   <SelectItem value="price-low">Price: Low to High</SelectItem>
//                   <SelectItem value="price-high">Price: High to Low</SelectItem>
//                   <SelectItem value="experience">Most Experienced</SelectItem>
//                   <SelectItem value="sessions">Most Sessions</SelectItem>
//                 </SelectContent>
//               </Select>

//               {/* Filter Toggle */}
//               <Button
//                 variant="outline"
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="w-full lg:w-auto"
//               >
//                 <Filter className="h-4 w-4 mr-2" />
//                 Filters
//               </Button>
//             </div>

//             {/* Advanced Filters */}
//             <AnimatePresence>
//               {showFilters && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-6 pt-6 border-t"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {/* Price Range */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Price Range (USD/hour)
//                       </label>
//                       <Slider
//                         value={priceRange}
//                         onValueChange={setPriceRange}
//                         max={300}
//                         min={0}
//                         step={10}
//                         className="mb-2"
//                       />
//                       <div className="flex justify-between text-sm text-gray-500">
//                         <span>${priceRange[0]}</span>
//                         <span>${priceRange[1]}</span>
//                       </div>
//                     </div>

//                     {/* Minimum Rating */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Minimum Rating
//                       </label>
//                       <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="0">Any Rating</SelectItem>
//                           <SelectItem value="3">3+ Stars</SelectItem>
//                           <SelectItem value="4">4+ Stars</SelectItem>
//                           <SelectItem value="4.5">4.5+ Stars</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     {/* Checkboxes */}
//                     <div className="space-y-3">
//                       <div className="flex items-center space-x-2">
//                         <Checkbox
//                           id="verified"
//                           checked={verifiedOnly}
//                           onCheckedChange={setVerifiedOnly}
//                         />
//                         <label htmlFor="verified" className="text-sm font-medium">
//                           Verified Only
//                         </label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Checkbox
//                           id="available"
//                           checked={availableOnly}
//                           onCheckedChange={setAvailableOnly}
//                         />
//                         <label htmlFor="available" className="text-sm font-medium">
//                           Available Now
//                         </label>
//                       </div>
//                     </div>

//                     {/* Reset Button */}
//                     <div className="flex items-end">
//                       <Button variant="outline" onClick={resetFilters} className="w-full">
//                         Reset Filters
//                       </Button>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Results Header */}
//           <div className="flex justify-between items-center mb-6">
//             <p className="text-gray-600">
//               Showing <span className="font-semibold">{filteredMentors.length}</span> mentors
//             </p>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm">
//                 <TrendingUp className="h-4 w-4 mr-2" />
//                 Popular This Week
//               </Button>
//             </div>
//           </div>

//           {/* Mentor Cards Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredMentors.map((mentor) => (
//               <motion.div
//                 key={mentor.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <Card className="h-full hover:shadow-lg transition-shadow duration-200">
//                   <CardHeader className="pb-4">
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-center space-x-3">
//                         <Avatar className="h-16 w-16">
//                           <AvatarImage src={mentor.profileImage} alt={mentor.name} />
//                           <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20">
//                             {mentor.name.split(" ").map(n => n[0]).join("")}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <h3 className="font-semibold text-lg">{mentor.name}</h3>
//                             {mentor.isVerified && (
//                               <CheckCircle className="h-5 w-5 text-green-500" />
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600">{mentor.expertiseArea}</p>
//                           <div className="flex items-center gap-1 mt-1">
//                             {renderStars(mentor.averageRating)}
//                             <span className="text-sm text-gray-600 ml-1">
//                               {mentor.averageRating} ({mentor.ratingCount} reviews)
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </CardHeader>

//                   <CardContent className="space-y-4">
//                     {/* Bio */}
//                     <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>

//                     {/* Skills */}
//                     <div className="flex flex-wrap gap-1">
//                       {mentor.skills.slice(0, 4).map((skill) => (
//                         <Badge key={skill} variant="secondary" className="text-xs">
//                           {skill}
//                         </Badge>
//                       ))}
//                       {mentor.skills.length > 4 && (
//                         <Badge variant="secondary" className="text-xs">
//                           +{mentor.skills.length - 4} more
//                         </Badge>
//                       )}
//                     </div>

//                     {/* Stats */}
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div className="flex items-center gap-1">
//                         <DollarSign className="h-4 w-4 text-gray-400" />
//                         <span>${mentor.hourlyRateUSD}/hr</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Users className="h-4 w-4 text-gray-400" />
//                         <span>{mentor.totalSessions} sessions</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Clock className="h-4 w-4 text-gray-400" />
//                         <span>{mentor.responseTime}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Award className="h-4 w-4 text-gray-400" />
//                         <span>{mentor.yearsExperience}y exp</span>
//                       </div>
//                     </div>

//                     {/* Availability Status */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className={`w-2 h-2 rounded-full ${
//                           mentor.availability === "Available" ? "bg-green-500" : "bg-yellow-500"
//                         }`} />
//                         <span className="text-sm text-gray-600">{mentor.availability}</span>
//                       </div>
//                       <div className="flex items-center gap-1 text-xs text-gray-500">
//                         <Globe className="h-3 w-3" />
//                         {mentor.languages.join(", ")}
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2 pt-2">
//                       <Link href={`/mentor/${mentor.id}`} className="flex-1">
//                         <Button className="w-full">
//                           <Calendar className="h-4 w-4 mr-2" />
//                           View Profile
//                         </Button>
//                       </Link>
//                       <Button variant="outline" size="sm">
//                         <MessageCircle className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           {/* No Results */}
//           {filteredMentors.length === 0 && (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Search className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors found</h3>
//               <p className="text-gray-600 mb-4">
//                 Try adjusting your search criteria or filters to find more mentors.
//               </p>
//               <Button onClick={resetFilters}>Reset All Filters</Button>
//             </div>
//           )}

//           {/* Call to Action */}
//           <div className="mt-12 text-center">
//             <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
//               <CardContent className="py-8">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                   Want to become a mentor?
//                 </h2>
//                 <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
//                   Share your expertise, help others grow, and earn ETH by mentoring the next generation of developers and creators.
//                 </p>
//                 <Link href="/mentor/register">
//                   <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
//                     Become a Mentor
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </Navigation>
//   )
// }
