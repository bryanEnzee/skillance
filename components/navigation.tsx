"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Zap, Users, Briefcase, Home, MessageCircle, Star } from "lucide-react"
import { ConnectWallet, useAddress } from "@thirdweb-dev/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface NavigationProps {
  children: React.ReactNode
}

export default function Navigation({ children }: NavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const address = useAddress()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not already on the main page and wallet is disconnected
    if (!address && pathname !== '/') {
      router.push('/');
    }
  }, [address, router, pathname])

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/mentor", label: "Mentors", icon: Users },
    { href: "/freelance", label: "Freelance", icon: Briefcase },
    { href: "/chat", label: "Chat", icon: MessageCircle, badge: 3 },
  ]

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home"
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 bottom-0 z-50 bg-black/90 border-r border-white/10 backdrop-blur-xl flex flex-col"
        initial={{ width: 80 }}
        animate={{ width: isExpanded ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-white/10">
          <Link href="/home">
            <motion.div className="flex items-center space-x-3 cursor-pointer" whileHover={{ scale: 1.05 }}>
              <div className="relative flex-shrink-0">
                <Zap className="h-8 w-8 text-blue-400" />
                <motion.div
                  className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl font-light tracking-wide whitespace-nowrap"
                  >
                    Skillance
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer relative ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <item.icon className="h-6 w-6" />
                    {item.badge && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-light whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Wallet Section */}
        <div className="p-4 border-t border-white/10">
          <motion.div whileHover={{ x: isExpanded ? 5 : 0 }} className="relative">
            <div className={isExpanded ? 'block' : 'opacity-0'}>
              <ConnectWallet 
                theme="dark"
                btnTitle={address ? "Connected" : "Connect Wallet"}
                className="w-full !bg-transparent hover:!bg-white/5 !px-4 !py-2 !border-white/10"
                modalSize="compact"
                hideTestnetFaucet
              />
            </div>
            <button
              onClick={() => (document.querySelector('.tw-connect-wallet') as HTMLElement)?.click()}
              className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 hover:bg-white/5 ${
                isExpanded ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
              }`}
            >
              <Wallet className={`h-5 w-5 ${address ? 'text-green-400' : 'text-red-400'}`} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="flex-1 transition-all duration-300"
        animate={{ marginLeft: isExpanded ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </div>
  )
}
