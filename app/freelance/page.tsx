"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, DollarSign, Clock, Users, Star, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import MyActivitiesButton from "@/components/my-activities-button"
import { fetchJobsFromSubgraph } from "@/lib/fetchJobsFromSubgraph"
import { fetchTotalJobs } from "@/lib/fetchTotalJobsFromSubgraph";
import { ethers } from "ethers"

export default function FreelancePage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsCount, setJobsCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let address: string | null = null;
                if (typeof window.ethereum !== 'undefined') {
                    try {
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        await provider.send("eth_requestAccounts", []);
                        const signer = provider.getSigner();
                        address = (await signer.getAddress()).toLowerCase();
                    } catch (error) {
                        console.error("Failed to get user address:", error);
                    }
                }
                setUserAddress(address);

                // Fetch jobs from subgraph
                const jobsFromSubgraph = await fetchJobsFromSubgraph();
                setJobs(jobsFromSubgraph);

                // Fetch stats (count)
                const { jobsCount } = await fetchTotalJobs();
                setJobsCount(jobsCount);
            } catch (error) {
                console.error("An error occurred:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredJobs = jobs.filter(
        (job) =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const handleJobRecommendation = (jobId: number) => {
        const element = document.getElementById(`job-${jobId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-blue-500/50");
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-blue-500/50");
            }, 3000);
        }
    };

    if (loading) {
        return (
            <Navigation>
                <div className="flex items-center justify-center min-h-screen text-white text-xl">
                    Loading...
                </div>
            </Navigation>
        );
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-extralight mb-4">
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Premium Projects
                                </span>
                            </h1>
                            <p className="text-gray-400 text-xl font-light">
                                Discover quality opportunities with stake-based applications
                            </p>
                        </div>
                        <Link href="/freelance/post">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 backdrop-blur-sm text-white font-light">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Post Job
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>

                {/* Search and Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-12"
                >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6 items-center">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input
                                        placeholder="Search projects by title or skills..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 bg-white/5 border-white/10 text-white placeholder-gray-400 h-12 rounded-xl backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                                    />
                                </div>
                                <div className="flex items-center space-x-6">
                                    <MyActivitiesButton />
                                    <div className="flex items-center space-x-8 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-green-400" />
                                            <span className="text-gray-300 font-light">
                                                <span className="text-white font-medium">{jobsCount ?? "—"}</span> active projects
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4 text-blue-400" />
                                            <span className="text-gray-300 font-light">
                                                <span className="text-white font-medium">$2.1M</span> total value
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Job Listings */}
                <div className="space-y-6">
                    {filteredJobs.map((job, index) => {
                        const isOwner = userAddress && job.employer && userAddress.toLowerCase() === job.employer.toLowerCase();
                        
                        return (
                            <motion.div
                                key={job.id}
                                id={`job-${job.id}`}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.6 }}
                                whileHover={{ y: -5 }}
                                className="transition-all duration-300 rounded-xl"
                            >
                                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group overflow-hidden relative">
                                    {job.urgent && (
                                        <motion.div
                                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.5, duration: 0.8 }}
                                        />
                                    )}

                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <Link href={`/freelance/${job.id}`}>
                                                        <h3 className="text-2xl font-light text-white hover:text-blue-400 cursor-pointer transition-colors duration-300 group-hover:text-blue-400">
                                                            {job.title}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center space-x-2">
                                                        {job.urgent && (
                                                            <motion.div
                                                                animate={{ scale: [1, 1.1, 1] }}
                                                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                                            >
                                                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-light">
                                                                    Urgent
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-light">New</Badge>
                                                    </div>
                                                </div>

                                                <p className="text-gray-300 mb-4 font-light">{job.company}</p>
                                                <p className="text-gray-400 mb-6 line-clamp-2 font-light leading-relaxed">{job.description}</p>

                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {job.skills.map((skill: string) => (
                                                        <Badge
                                                            key={skill}
                                                            variant="secondary"
                                                            className="bg-white/5 text-gray-300 border-white/10 font-light hover:bg-white/10 transition-colors duration-300"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-right ml-8">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-white font-medium">{job.rating}</span>
                                                </div>
                                                
                                               
                                                {isOwner ? (
                                                    <Link href={`/freelance/${job.id}/apply`}>
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button className="bg-white/5 border-white/10 text-gray-400 font-light min-w-[120px] hover:bg-white/10">
                                                                Your Post
                                                            </Button>
                                                        </motion.div>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/freelance/${job.id}/apply`}>
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 border-0 backdrop-blur-sm text-white font-light min-w-[120px]">
                                                                Apply Now
                                                            </Button>
                                                        </motion.div>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                            <div className="flex items-center space-x-8 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4 text-green-400" />
                                                    <span className="text-white font-medium">{job.budget}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-blue-400" />
                                                    <span className="text-gray-300 font-light">{job.duration}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-purple-400" />
                                                    <span className="text-gray-300 font-light">{job.applicants} applicants</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-yellow-400" />
                                                    <span className="text-gray-300 font-light">
                                                        Stake: <span className="text-yellow-400 font-medium">${job.stakeRequired}</span>
                                                    </span>
                                                </div>
                                                <span className="text-gray-500 font-light">Posted {job.posted}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Load More */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-center mt-12"
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light px-8 py-3"
                        >
                            Load More Projects
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </Navigation>
    );
}
