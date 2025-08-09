"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Users, Briefcase, Shield, Star, ArrowRight, ChevronDown, CreditCard, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import components to prevent SSR issues
const WalletConnectButton = dynamic(() => import("@/components/wallet-connect"), {
  ssr: false,
})

const ArchitectureFlow = dynamic(() => import("@/components/ArchitectureFlow"), {
  ssr: false,
})

export default function LandingPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleWalletConnect = async () => {
    setIsConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnecting(false)
    router.push("/home")
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative scrollbar-hide">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        body {
          overflow-x: hidden;
        }
        
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }
        
        html::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black"></div>
        <motion.div
          className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          style={{ left: "10%", top: "20%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.02,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          style={{ right: "10%", bottom: "20%" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <Image src="/skillance-logo.png" alt="Skillance Logo" width={32} height={32} className="h-8 w-8" />
                <motion.div
                  className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
              <span className="text-2xl font-light tracking-wide">Skillance</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: "Features", href: "#features" },
                { label: "How it Works", href: "#how-it-works" },
                { label: "Security", href: "#security" }
              ].map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-light tracking-wide"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-extralight mb-8 leading-tight text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Skill up
              </span>
              <span className="text-white"> before</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                Freelance
              </span>
              <span className="text-white"> out</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Connect with industry experts and discover premium opportunities in a
              <br />
              <span className="text-white">trustless ecosystem</span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-8">
                <motion.div className="flex items-center justify-center space-x-3 mb-6" whileHover={{ scale: 1.05 }}>
                  <div className="relative">
                    <Wallet className="h-6 w-6 text-blue-400" />
                    <motion.div
                      className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                  <span className="text-xl font-light">Connect Wallet</span>
                </motion.div>

                <p className="text-gray-400 mb-8 text-sm font-light text-center">Secure access using your digital wallet</p>

                <div className="w-full">
                  <WalletConnectButton />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="relative z-10 py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.h2
            className="text-5xl font-extralight text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Platform Features
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: "Mentor Network",
                features: ["AI-powered matching", "Secure booking", "Integrated chat", "Reward system"],
                color: "from-green-400/20 to-emerald-600/20",
                iconColor: "text-green-400",
              },
              {
                icon: Briefcase,
                title: "Freelance Marketplace",
                features: ["Quality assurance", "Stake-based applications", "Secure payments", "Reputation system"],
                color: "from-purple-400/20 to-pink-600/20",
                iconColor: "text-purple-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 h-full">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>

                    <h3 className="text-2xl font-light mb-6 text-white">{feature.title}</h3>

                    <div className="space-y-3">
                      {feature.features.map((item, i) => (
                        <motion.div
                          key={item}
                          className="flex items-center space-x-3 text-gray-400"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 + i * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          <span className="font-light">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section
        id="how-it-works"
        className="relative z-10 py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.h2
            className="text-5xl font-extralight text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How it Works
            </span>
          </motion.h2>

          <div className="max-w-7xl mx-auto">
            {/* Architecture Diagram using ReactFlow */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <ArchitectureFlow />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Security Section */}
      <motion.section
        id="security"
        className="relative z-10 py-32 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-5xl font-extralight mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Built for Security
            </span>
          </motion.h2>

          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-16">
            {[
              { icon: Shield, label: "Blockchain Secured", color: "text-blue-400" },
              { icon: Star, label: "Reputation Based", color: "text-yellow-400" },
              { icon: CreditCard, label: "Instant Payments", color: "text-green-400" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex items-center space-x-4 group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <item.icon
                    className={`h-8 w-8 ${item.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <motion.div
                    className={`absolute inset-0 ${item.color.replace("text-", "bg-")}/20 rounded-full blur-md`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                  />
                </div>
                <span className="text-gray-300 font-light text-lg group-hover:text-white transition-colors duration-300">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
