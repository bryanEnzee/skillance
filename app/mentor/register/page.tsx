"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, User, Star, AlertCircle, Upload, X, Briefcase, DollarSign, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/navigation"
import { ethers } from "ethers"
import { MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI } from "@/lib/contract"
import { useAddress } from "@thirdweb-dev/react"
import Link from "next/link"

// Expertise areas
const EXPERTISE_AREAS = [
    "React Development",
    "Blockchain Development",
    "UI/UX Design",
    "Full-Stack Development",
    "Mobile Development",
    "DevOps & Cloud",
    "Data Science",
    "Machine Learning",
    "Product Management",
    "Digital Marketing",
    "Business Strategy",
    "Cybersecurity"
]

// Common skills
const COMMON_SKILLS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Solidity",
    "Smart Contracts", "DeFi", "Web3", "Figma", "Adobe XD", "AWS", "Docker",
    "Kubernetes", "MongoDB", "PostgreSQL", "GraphQL", "REST APIs", "Git"
]

// Languages
const LANGUAGES = [
    "English", "Spanish", "French", "German", "Chinese", "Japanese",
    "Korean", "Portuguese", "Russian", "Arabic", "Hindi", "Italian"
]

interface FormData {
    name: string
    expertiseArea: string
    bio: string
    hourlyRate: string
    portfolioUrl: string
    yearsExperience: string
    skills: string[]
    languages: string[]
    profileImage: File | null
}

export default function MentorRegisterPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)
    const [mentorId, setMentorId] = useState<number | null>(null)
    const [transactionHash, setTransactionHash] = useState<string>("")
    const address = useAddress() // Use existing wallet connection

    const [formData, setFormData] = useState<FormData>({
        name: "",
        expertiseArea: "",
        bio: "",
        hourlyRate: "",
        portfolioUrl: "",
        yearsExperience: "",
        skills: [],
        languages: [],
        profileImage: null
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = "Name is required"
            if (!formData.expertiseArea) newErrors.expertiseArea = "Expertise area is required"
            if (!formData.bio.trim()) newErrors.bio = "Bio is required"
            if (formData.bio.length < 50) newErrors.bio = "Bio must be at least 50 characters"
        }

        if (step === 2) {
            if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
                newErrors.hourlyRate = "Valid hourly rate is required"
            }
            if (!formData.yearsExperience || parseInt(formData.yearsExperience) < 0) {
                newErrors.yearsExperience = "Years of experience is required"
            }
            if (formData.skills.length === 0) {
                newErrors.skills = "At least one skill is required"
            }
        }

        if (step === 3) {
            if (formData.languages.length === 0) {
                newErrors.languages = "At least one language is required"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4))
        }
    }

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSkillToggle = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }))
    }

    const handleLanguageToggle = (language: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(language)
                ? prev.languages.filter(l => l !== language)
                : [...prev.languages, language]
        }))
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }))
        }
    }

    const checkExistingRegistration = async () => {
        if (!address) return false

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI, provider)

            // Check if address is already registered
            const existingMentorId = await contract.mentorAddressToId(address)

            if (existingMentorId.toString() !== "0") {
                // Address is already registered
                const mentor = await contract.getMentor(existingMentorId)
                alert(`You are already registered as Mentor ID #${existingMentorId.toString()}!\n\nName: ${mentor.name}\nExpertise: ${mentor.expertiseArea}\nHourly Rate: ${ethers.utils.formatEther(mentor.hourlyRate)} ETH\n\nYou can start accepting bookings immediately!`)
                return true
            }
            return false
        } catch (error) {
            console.error("Error checking existing registration:", error)
            return false
        }
    }

    const submitRegistration = async () => {
        if (!validateStep(3) || !address) return

        // Commented out for debugging - allow multiple registrations
        // const alreadyRegistered = await checkExistingRegistration()
        // if (alreadyRegistered) return

        setIsSubmitting(true)
        let provider: ethers.providers.Web3Provider | null = null

        try {
            console.log("Starting mentor registration on Sapphire...")

            // Check if we have MetaMask
            if (!window.ethereum) {
                alert("Please install MetaMask to register as a mentor")
                return
            }

            console.log("Using wallet address:", address)
            provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()

            // Verify signer address matches connected address
            const signerAddress = await signer.getAddress()
            console.log("Signer address:", signerAddress)

            // Switch to Sapphire Testnet
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5AFF' }], // 23295 in hex
                })
            } catch (switchError: any) {
                // If network doesn't exist, add it
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x5AFF',
                            chainName: 'Sapphire Testnet',
                            nativeCurrency: {
                                name: 'TEST',
                                symbol: 'TEST',
                                decimals: 18
                            },
                            rpcUrls: ['https://testnet.sapphire.oasis.dev'],
                            blockExplorerUrls: ['https://explorer.sapphire.oasis.io']
                        }]
                    })
                }
            }

            // Convert hourly rate to wei (assuming rate is in ETH)
            const hourlyRateWei = ethers.utils.parseEther(formData.hourlyRate)

            // Create contract instance
            const mentorRegistry = new ethers.Contract(MENTOR_REGISTRY_ADDRESS, MENTOR_REGISTRY_ABI, signer)

            console.log("Calling selfRegister on contract:", MENTOR_REGISTRY_ADDRESS)
            console.log("Registration data:", {
                name: formData.name,
                expertiseArea: formData.expertiseArea,
                bio: formData.bio,
                hourlyRate: hourlyRateWei.toString(),
                portfolioUrl: formData.portfolioUrl,
                yearsExperience: parseInt(formData.yearsExperience),
                skills: formData.skills,
                languages: formData.languages
            })

            // Call the contract
            const tx = await mentorRegistry.selfRegister(
                formData.name,
                formData.expertiseArea,
                formData.bio,
                hourlyRateWei,
                formData.portfolioUrl,
                parseInt(formData.yearsExperience),
                formData.skills,
                formData.languages
            )

            console.log("Transaction sent:", tx.hash)
            console.log("Waiting for confirmation...")

            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt.transactionHash)

            // Parse the MentorRegistered event to get the mentor ID
            const mentorRegisteredEvent = receipt.events?.find((event: any) => event.event === 'MentorRegistered')
            const newMentorId = mentorRegisteredEvent?.args?.mentorId?.toNumber()

            if (newMentorId) {
                setMentorId(newMentorId)
                setTransactionHash(receipt.transactionHash)
                setIsRegistered(true)
                setCurrentStep(4)
                console.log("✅ Mentor registration successful! ID:", newMentorId)
                console.log("🔗 View on Sapphire Explorer:", `https://explorer.sapphire.oasis.io/testnet/tx/${receipt.transactionHash}`)
            } else {
                throw new Error("Failed to get mentor ID from transaction")
            }
        } catch (error: any) {
            console.error("Registration failed:", error)
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                data: error.data,
                reason: error.reason,
                stack: error.stack
            })

            let errorMessage = "Registration failed. Please try again."

            if (error.code === 4001) {
                errorMessage = "Transaction was rejected by user."
            } else if (error.code === -32603) {
                errorMessage = "Internal JSON-RPC error. Check network connection."
            } else if (error.message?.includes("already registered")) {
                errorMessage = "This wallet address is already registered as a mentor."
            } else if (error.message?.includes("insufficient funds")) {
                errorMessage = "Insufficient funds for gas fees."
            } else if (error.message?.includes("network")) {
                errorMessage = "Network error. Please check your connection to Sapphire Testnet."
            } else if (error.message?.includes("execution reverted")) {
                errorMessage = `Contract execution failed: ${error.reason || error.message}`
            } else if (error.message?.includes("user rejected")) {
                errorMessage = "Transaction was rejected by user."
            }

            alert(`${errorMessage}\n\nTechnical details: ${error.message}`)

            // Log contract details for debugging
            console.log("Contract Address:", MENTOR_REGISTRY_ADDRESS)
            console.log("Network should be Sapphire Testnet (Chain ID: 23295)")
            if (provider) {
                try {
                    const network = await provider.getNetwork()
                    console.log("Current network:", network)
                } catch (networkError) {
                    console.log("Could not get network info:", networkError)
                }
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!address) {
        return (
            <Navigation>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold">Become a Mentor</CardTitle>
                            <p className="text-gray-600">Please connect your wallet first</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500 text-center">
                                Use the wallet connection in the sidebar to get started with mentor registration.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Navigation>
        )
    }

    return (
        <Navigation>
            <div className="min-h-screen bg-black py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Progress Bar */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                {[1, 2, 3, 4].map((step, index) => (
                                    <div key={step} className="flex items-center" style={{ width: index === 3 ? 'auto' : '100%' }}>
                                        <motion.div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold relative z-10 ${currentStep >= step
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-2 border-blue-400'
                                                    : 'bg-gray-800 text-gray-400 border-2 border-gray-600'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            animate={currentStep === step ? {
                                                scale: [1, 1.1, 1],
                                                boxShadow: [
                                                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                                                    "0 0 0 8px rgba(59, 130, 246, 0)",
                                                    "0 0 0 0 rgba(59, 130, 246, 0.7)"
                                                ]
                                            } : {}}
                                            transition={{ duration: 2, repeat: currentStep === step ? Infinity : 0 }}
                                        >
                                            {isRegistered && step === 4 ? (
                                                <CheckCircle className="h-6 w-6 text-white" />
                                            ) : (
                                                <span className="font-bold">{step}</span>
                                            )}
                                        </motion.div>
                                        {step < 4 && (
                                            <div className="flex-1 mx-6 relative">
                                                <div className="h-2 bg-gray-700 rounded-full">
                                                    <motion.div
                                                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                                        initial={{ width: '0%' }}
                                                        animate={{ width: currentStep > step ? '100%' : '0%' }}
                                                        transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            {['Basic Info', 'Skills & Rate', 'Languages & Portfolio', 'Complete'].map((label, index) => (
                                <motion.span
                                    key={label}
                                    className={`font-medium ${currentStep >= index + 1
                                            ? 'text-blue-400'
                                            : 'text-gray-500'
                                        }`}
                                    animate={currentStep >= index + 1 ? {
                                        color: ["#60a5fa", "#a855f7", "#60a5fa"]
                                    } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {label}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Alice Johnson"
                                                className={errors.name ? "border-red-500" : ""}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="expertise">Expertise Area *</Label>
                                            <Select value={formData.expertiseArea} onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, expertiseArea: value }))
                                            }>
                                                <SelectTrigger className={errors.expertiseArea ? "border-red-500" : ""}>
                                                    <SelectValue placeholder="Select your main expertise" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXPERTISE_AREAS.map((area) => (
                                                        <SelectItem key={area} value={area}>{area}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.expertiseArea && <p className="text-red-500 text-sm mt-1">{errors.expertiseArea}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="bio">Professional Bio * (minimum 50 characters)</Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                                placeholder="Tell potential mentees about your experience, achievements, and what you can help them with..."
                                                rows={4}
                                                className={errors.bio ? "border-red-500" : ""}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                                                <p className="text-gray-500 text-sm ml-auto">{formData.bio.length}/50</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 2: Skills & Rate */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Skills & Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="rate">Hourly Rate (ETH) *</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="rate"
                                                        type="number"
                                                        step="0.001"
                                                        value={formData.hourlyRate}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                                                        placeholder="0.05"
                                                        className={`pl-10 ${errors.hourlyRate ? "border-red-500" : ""}`}
                                                    />
                                                </div>
                                                {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="experience">Years of Experience *</Label>
                                                <Input
                                                    id="experience"
                                                    type="number"
                                                    value={formData.yearsExperience}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                                                    placeholder="5"
                                                    className={errors.yearsExperience ? "border-red-500" : ""}
                                                />
                                                {errors.yearsExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Skills * (Select all that apply)</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                                                {COMMON_SKILLS.map((skill) => (
                                                    <div key={skill} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={skill}
                                                            checked={formData.skills.includes(skill)}
                                                            onCheckedChange={() => handleSkillToggle(skill)}
                                                        />
                                                        <Label htmlFor={skill} className="text-sm">{skill}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                                            {formData.skills.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 mb-2">Selected skills:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {formData.skills.map((skill) => (
                                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 3: Languages & Portfolio */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="h-5 w-5" />
                                            Languages & Portfolio
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label>Languages * (Select all that you speak)</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                                                {LANGUAGES.map((language) => (
                                                    <div key={language} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={language}
                                                            checked={formData.languages.includes(language)}
                                                            onCheckedChange={() => handleLanguageToggle(language)}
                                                        />
                                                        <Label htmlFor={language} className="text-sm">{language}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
                                            {formData.languages.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 mb-2">Selected languages:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {formData.languages.map((language) => (
                                                            <Badge key={language} variant="secondary">{language}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
                                            <Input
                                                id="portfolio"
                                                value={formData.portfolioUrl}
                                                onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                                placeholder="https://github.com/alice or https://alice-portfolio.com"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="image">Profile Image (optional)</Label>
                                            <div className="mt-2">
                                                <label htmlFor="image" className="cursor-pointer">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {formData.profileImage ? formData.profileImage.name : "Click to upload profile image"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                    </div>
                                                    <input
                                                        id="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 4: Success */}
                        {currentStep === 4 && isRegistered && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative"
                            >
                                <Card className="bg-black/90 border-green-500/30 backdrop-blur-xl text-center overflow-hidden">
                                    {/* Animated background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 animate-pulse" />

                                    <CardContent className="relative pt-8 pb-8">
                                        {/* Success Icon with Animation */}
                                        <motion.div
                                            className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                boxShadow: [
                                                    "0 0 20px rgba(34, 197, 94, 0.3)",
                                                    "0 0 40px rgba(34, 197, 94, 0.6)",
                                                    "0 0 20px rgba(34, 197, 94, 0.3)"
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <CheckCircle className="h-10 w-10 text-white" />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-green-400"
                                                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>

                                        <motion.h2
                                            className="text-3xl font-light text-white mb-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                                Registration Complete!
                                            </span>
                                        </motion.h2>

                                        <motion.p
                                            className="text-gray-300 mb-6 text-lg"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            Welcome to the platform! Your mentor ID is{' '}
                                            <span className="text-green-400 font-semibold">#{mentorId}</span>
                                        </motion.p>

                                        {/* Transaction Details Card */}
                                        <motion.div
                                            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6 backdrop-blur-sm"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <h3 className="text-blue-400 font-medium mb-3 flex items-center justify-center">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
                                                Transaction Details
                                            </h3>
                                            <p className="text-xs text-gray-400 break-all mb-3 font-mono bg-black/30 p-3 rounded-lg">
                                                <strong className="text-blue-300">TX:</strong> {transactionHash}
                                            </p>
                                            <a
                                                href={`https://explorer.sapphire.oasis.io/tx/${transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm font-medium"
                                            >
                                                <span>View on Sapphire Testnet Explorer</span>
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </motion.div>

                                        {/* Verification Status Card */}
                                        <motion.div
                                            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <div className="flex items-center justify-center mb-3">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="mr-2"
                                                >
                                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                                                </motion.div>
                                                <span className="font-medium text-yellow-400">Pending Verification</span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                Your profile is under review by our admin team. You'll receive an email once verified.
                                                Verified mentors get priority in search results and can start accepting bookings immediately.
                                            </p>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            className="space-y-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <Link href="/mentor">
                                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 h-12 text-base font-medium transition-all duration-300 transform hover:scale-105">
                                                    <Star className="mr-2 h-5 w-5" />
                                                    View My Profile
                                                </Button>
                                            </Link>
                                            <Link href="/mentor">
                                                <Button variant="outline" className="w-full border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm h-12 text-base font-medium transition-all duration-300 transform hover:scale-105">
                                                    Browse Other Mentors
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {currentStep < 4 && (
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </Button>

                            {currentStep < 3 ? (
                                <Button onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={submitRegistration}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? "Registering..." : "Complete Registration"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Navigation>
    )
}
