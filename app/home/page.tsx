"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, TrendingUp, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const stats = [
    { label: "Total Earnings", value: "$2,450", icon: TrendingUp, color: "text-green-400" },
    { label: "Active Projects", value: "3", icon: Briefcase, color: "text-blue-400" },
    { label: "Mentorship Hours", value: "24", icon: Users, color: "text-purple-400" },
    { label: "Rating", value: "4.9", icon: Star, color: "text-yellow-400" },
  ]

  const activities = [
    { action: "Completed mentorship session with Sarah Chen", time: "2 hours ago", color: "bg-green-400" },
    { action: "Applied for React Developer position", time: "1 day ago", color: "bg-blue-400" },
    { action: "Received 5-star review from client", time: "3 days ago", color: "bg-purple-400" },
  ]

  return (
    <Navigation>
      <div className="p-6 lg:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-extralight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Choose your path in the decentralized economy</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-light mb-2">{stat.label}</p>
                      <p className={`text-3xl font-light ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className="relative">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <motion.div
                        className={`absolute inset-0 ${stat.color.replace("text-", "bg-")}/20 rounded-full blur-md`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 mb-16"
        >
          {[
            {
              id: "mentor",
              icon: Users,
              title: "Mentor Network",
              description: "Connect with industry experts and accelerate your growth through personalized mentorship",
              features: ["AI-powered matching", "Book consultations", "Earn rewards"],
              color: "from-purple-500/20 to-pink-500/20",
              iconColor: "text-purple-400",
              href: "/mentor",
            },
            {
              id: "freelance",
              icon: Briefcase,
              title: "Freelance Market",
              description: "Discover premium projects and build your reputation in the decentralized economy",
              features: ["Quality assurance", "Secure payments", "Stake-based trust"],
              color: "from-blue-500/20 to-cyan-500/20",
              iconColor: "text-blue-400",
              href: "/freelance",
            },
          ].map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
              onHoverStart={() => setHoveredCard(section.id)}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <Link href={section.href}>
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 h-full overflow-hidden relative">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <section.icon className={`h-8 w-8 ${section.iconColor}`} />
                      </div>
                      <motion.div animate={{ x: hoveredCard === section.id ? 5 : 0 }} transition={{ duration: 0.3 }}>
                        <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                      </motion.div>
                    </div>

                    <h3 className="text-3xl font-light mb-4 text-white group-hover:text-white transition-colors duration-300">
                      {section.title}
                    </h3>

                    <p className="text-gray-400 mb-6 font-light leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {section.description}
                    </p>

                    <div className="space-y-3">
                      {section.features.map((feature, i) => (
                        <motion.div
                          key={feature}
                          className="flex items-center space-x-3 text-gray-400 group-hover:text-gray-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                        >
                          <div className={`w-1.5 h-1.5 ${section.iconColor.replace("text-", "bg-")} rounded-full`} />
                          <span className="font-light">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-light mb-8 text-white">Recent Activity</h3>
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                    className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/5 -mx-4 px-4 rounded-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`w-3 h-3 ${activity.color} rounded-full`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      />
                      <span className="text-gray-300 font-light group-hover:text-white transition-colors duration-300">
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm font-light">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Navigation>
  )
}
