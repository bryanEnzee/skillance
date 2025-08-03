"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Wallet, TrendingUp, Star, MessageCircle } from "lucide-react"
import Link from "next/link"
import { ConnectWallet, useAddress } from "@thirdweb-dev/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const address = useAddress();
  const router = useRouter();

  useEffect(() => {
    if (!address) {
      router.push('/');
    }
  }, [address, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2">Choose your path in the decentralized economy</p>
          </div>
          <ConnectWallet 
            theme="dark"
            btnTitle={address ? "Connected" : "Connect Wallet"}
            className={`!border-0 !text-white transition-all duration-300 ${
              address 
                ? "!bg-white/5 hover:!bg-white/10" 
                : "!bg-red-500/5 hover:!bg-red-500/10"
            }`}
            modalSize="compact"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">$2,450</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-400">3</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mentorship Hours</p>
                  <p className="text-2xl font-bold text-purple-400">24</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">4.9</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <Users className="h-8 w-8 text-purple-400" />
                <span>Mentor Network</span>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Connect with industry experts and grow your skills through personalized mentorship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <MessageCircle className="h-4 w-4 text-purple-400" />
                  <span>AI-powered mentor matching</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Star className="h-4 w-4 text-purple-400" />
                  <span>Book consultations & earn rewards</span>
                </div>
              </div>
              <Link href="/mentor">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3">
                  Explore Mentors
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <Briefcase className="h-8 w-8 text-blue-400" />
                <span>Freelance Market</span>
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Discover high-quality projects and build your reputation in the decentralized economy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span>Stake-based quality assurance</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span>Secure payments & reviews</span>
                </div>
              </div>
              <Link href="/freelance">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Completed mentorship session with Sarah Chen</span>
                </div>
                <span className="text-gray-400 text-sm">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Applied for "React Developer" position</span>
                </div>
                <span className="text-gray-400 text-sm">1 day ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Received 5-star review from client</span>
                </div>
                <span className="text-gray-400 text-sm">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
