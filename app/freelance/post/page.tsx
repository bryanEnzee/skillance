"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, DollarSign, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import { ethers } from "ethers"
import { getFreelanceJobsContract } from "@/lib/contract"

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    skills: [] as string[],
    stakeRequired: 0.025,
  })
  const [newSkill, setNewSkill] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [isPosted, setIsPosted] = useState(false)

  // State untuk file dokumen
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPosting(true)
    // window.location.href = "/freelance"


    try {
      const contract = getFreelanceJobsContract()

      // Convert values from form data to the correct format
      const budgetInWei = ethers.utils.parseEther(formData.budget)
      const stakeRequiredInWei = ethers.utils.parseEther(formData.stakeRequired.toString())
      const postingFee = "0.005"

      // TODO: Upload attachedFiles to storage (IPFS/S3/Backend) dan ambil link
      // Contoh dummy:
      const documentLinks = attachedFiles.map((file) => file.name) // ganti dengan link hasil upload

      const tx = await contract.postJob(
        formData.title,
        formData.description + "\nDocuments: " + JSON.stringify(documentLinks),
        JSON.stringify(formData.skills),
        budgetInWei,
        Number(formData.duration),
        stakeRequiredInWei,
        { value: ethers.utils.parseEther(postingFee) }
      )

      await tx.wait()
      setIsPosted(true)
    } catch (error: any) {
      console.error("Failed to post job:", error)
      let message = "Something went wrong while posting the job."
      if (error?.reason) {
        message += ` Reason: ${error.reason}`
      } else if (error?.data?.message) {
        message += ` Message: ${error.data.message}`
      } else if (error?.message) {
        message += ` Message: ${error.message}`
      }
      alert(message)
    } finally {
      setIsPosting(false)
    }
  }

  if (isPosted) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <Card className="max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-light text-white mb-2">Job Posted Successfully!</h2>
                <p className="text-gray-300 mb-6 font-light">
                  Your job listing is now live and visible to freelancers.
                </p>
                <div className="space-y-3">
                  <Link href="/freelance">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 font-light">
                        View All Jobs
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/home">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-gray-300 hover:bg-white/10 bg-transparent backdrop-blur-sm font-light"
                      >
                        Back to Home
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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/freelance">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </motion.div>
            </Link>
          </div>
          <h1 className="text-5xl font-extralight mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Post a Job</span>
          </h1>
          <p className="text-gray-400 text-xl font-light">Create a quality job listing with payment requirement</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white font-light text-2xl">Job Details</CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Provide comprehensive information about your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white font-light">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., React Developer for E-commerce Platform"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white font-light">Project Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project requirements, goals, and expectations..."
                      rows={6}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Budget and Duration */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-white font-light">Budget</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="ETH"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white font-light">Project Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="In days"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label className="text-white font-light">Required Skills</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button type="button" onClick={addSkill} size="sm" className="bg-blue-500/80 hover:bg-blue-500 font-light">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.skills.map((skill, index) => (
                          <motion.div key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light">
                              {skill}
                              <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400 transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attach Documents */}
                  <div className="space-y-2">
                    <Label className="text-white font-light">Attach Documents</Label>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          onClick={() => document.getElementById('fileInput')?.click()}
                          size="sm"
                          className="bg-blue-500/80 hover:bg-blue-500 font-light"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-col gap-2 mt-4">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded">
                            <span className="text-gray-300 text-sm truncate">{file.name}</span>
                            <button type="button" onClick={() => removeFile(index)} className="text-red-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stake Requirement */}
                  <div className="space-y-2">
                    <Label htmlFor="stake" className="text-white font-light">Application Stake Requirement</Label>
                    <div className="relative">
                      <Input
                        id="stake"
                        type="number"
                        value={formData.stakeRequired}
                        onChange={(e) => setFormData({ ...formData, stakeRequired: Number.parseInt(e.target.value) || 0 })}
                        className="pl-10 bg-white/5 border-white/10 text-white font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                        min="50"
                        max="500"
                      />
                    </div>
                    <p className="text-sm text-gray-400 font-light">
                      Applicants must stake this amount to apply. Higher stakes ensure more committed applicants.
                    </p>
                  </div>

                  {/* Payment Info */}
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <h4 className="text-white font-light text-lg">Posting Fee</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-4 font-light">
                        A posting fee ensures quality job listings and serious employers.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-light">Posting Fee:</span>
                        <span className="text-green-400 font-semibold text-xl">0.005 ETH</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isPosting || !formData.title || !formData.description || !formData.budget}
                      className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 text-white font-light py-4 text-lg"
                    >
                      {isPosting ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          <span>Processing Payment & Posting...</span>
                        </div>
                      ) : (
                        "Post Job & Pay 0.005 ETH"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Navigation>
  )
}