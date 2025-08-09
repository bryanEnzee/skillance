"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Clock, Users, CheckCircle, Shield, XCircle, Link as LinkIcon, Edit, Upload } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navigation from "@/components/navigation";
import { useParams } from "next/navigation";
import { request, gql } from "graphql-request";
import { ethers, BigNumber } from "ethers";
import FreelanceJobsABI from "@/artifacts/contracts/FreelanceJobs.sol/FreelanceJobs.json"; 
// import FreelanceJobsContract from "@/lib/contract";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118071/skillance/v0.0.11";
const CONTRACT_ADDRESS = "0x2d4BdDCEfc75335Ae8653bEEc453eAF326804B5b"; 

const GET_JOB_WITH_APPLICATIONS_QUERY = gql`
  query GetJobWithApplications($id: ID!) {
    job(id: $id) {
      id
      jobId
      title
      description
      skills
      budget
      durationInDays
      stakeRequired
      postedAt
      employer
      hasFreelancer
      acceptedApplicant
      submittedWorkUrl
      workSubmitted
      paid
      applications {
        id
        applicant
        proposal
        status
      }
    }
  }
`;

interface ApplicationData {
  id: string;
  applicant: string;
  proposal: string;
  status: string;
}

interface SingleJobData {
  job: {
    id: string;
    jobId: string;
    title: string;
    description: string;
    skills: string[];
    budget: string;
    durationInDays: number;
    stakeRequired: string;
    postedAt: string;
    employer: string;
    hasFreelancer: boolean;
    acceptedApplicant: string;
    submittedWorkUrl: string;
    workSubmitted: boolean;
    paid: boolean;
    applications: ApplicationData[];
  };
}

const fetchJobDetails = async (jobId: string) => {
  const data = await request<SingleJobData>(SUBGRAPH_URL, GET_JOB_WITH_APPLICATIONS_QUERY, { id: jobId });
  const job = data.job;

  if (!job) return null;

  const descriptionLines = job.description.split('Project documents:');
  const cleanedDescription = descriptionLines[0].trim();
  const documentUrls = descriptionLines.length > 1 ? descriptionLines[1].trim().split(',').map(url => url.trim()) : [];

 let skillsArray: string[];
  if (Array.isArray(job.skills)) {
    skillsArray = job.skills;
  } else if (typeof job.skills === 'string') {
    try {
      skillsArray = JSON.parse(job.skills || "[]");
      if (!Array.isArray(skillsArray)) {
        skillsArray = (job.skills || "").split(',').map(s => s.trim());
      }
    } catch (e) {
      skillsArray = (job.skills || "").split(',').map(s => s.trim());
    }
  } else {
    skillsArray = [];
  }

  return {
    ...job,
    id: job.id,
    title: job.title,
    description: cleanedDescription || "",
    skills: skillsArray,
    budget: `${Number(job.budget) / 1e18} ETH`,
    duration: `${job.durationInDays || 0} days`,
    stakeRequired: Number(job.stakeRequired || "0") / 1e18,
    employer: job.employer,
    documentUrls: documentUrls,
    applications: job.applications,
    acceptedApplicant: job.acceptedApplicant,
    hasFreelancer: job.hasFreelancer,
    submittedWorkUrl: job.submittedWorkUrl,
    workSubmitted: job.workSubmitted,
    paid: job.paid
  };
};
export default function ApplyJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [jobData, setJobData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<ApplicationData[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [submittedWorkUrl, setSubmittedWorkUrl] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [viewMoreStatus, setViewMoreStatus] = useState<Record<string, boolean>>({});

  const toggleViewMore = (applicantId: string) => {
    setViewMoreStatus(prevStatus => ({
      ...prevStatus,
      [applicantId]: !prevStatus[applicantId]
    }));
  };

  const getUserAddress = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = (await signer.getAddress()).toLowerCase();
        setUserAddress(address);
      } catch (error) {
        console.error("Failed to get user address:", error);
      }
    }
  };

  const fetchData = async () => {
    if (!jobId) {
      setError("Job ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchJobDetails(jobId);
      if (data) {
        setJobData(data);
        setApplicants(data.applications);
        
        if (userAddress) {
          const hasUserApplied = data.applications.some(app => app.applicant.toLowerCase() === userAddress.toLowerCase());
          setIsApplied(hasUserApplied);
        }
      } else {
        setError("Job not found.");
      }
    } catch (e: any) {
      console.error("Error fetching job data from subgraph:", e);
      setError(e.message);
    } finally {
      setLoading(false);
      setApplicantsLoading(false);
    }
  };

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchData();
    }
  }, [jobId, userAddress]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask to apply.");
      setIsApplying(false);
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI, signer);
      
      const stakeAmount = ethers.utils.parseEther(jobData.stakeRequired.toString());
      
      const tx = await contract.applyForJob(
        jobData.jobId,
        proposal,
        { value: stakeAmount }
      );
      await tx.wait();
      
      setIsApplying(false);
      setIsApplied(true);
      fetchData(); 
      
    } catch (error: any) {
      console.error("Error applying for job:", error);
      alert(`Failed to apply: ${error.message || "Unknown error"}`);
      setIsApplying(false);
    }
  };
  
  const handleAccept = async (applicantAddress: string) => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask.");
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI, signer);
      
      const tx = await contract.acceptApplication(jobData.jobId, applicantAddress);
      await tx.wait();
      
      alert("Applicant accepted successfully!");
      fetchData(); 
      
    } catch (error: any) {
      console.error("Error accepting application:", error);
      alert(`Failed to accept: ${error.message || "Unknown error"}`);
    }
  };

  const handleReject = async (applicantAddress: string) => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask.");
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI, signer);
      
      const tx = await contract.rejectApplication(jobData.jobId, applicantAddress);
      await tx.wait();
      
      alert("Applicant rejected successfully, stake returned.");
      fetchData(); 
      
    } catch (error: any) {
      console.error("Error rejecting application:", error);
      alert(`Failed to reject: ${error.message || "Unknown error"}`);
    }
  };

  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWork(true);
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask.");
      setIsSubmittingWork(false);
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI, signer);
      
      const tx = await contract.submitWork(jobData.jobId, submittedWorkUrl);
      await tx.wait();
      
      alert("Work submitted successfully!");
      setIsSubmittingWork(false);
      fetchData();
      
    } catch (error: any) {
      console.error("Error submitting work:", error);
      alert(`Failed to submit work: ${error.message || "Unknown error"}`);
      setIsSubmittingWork(false);
    }
  };

  const handleApprovePayment = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask.");
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI, signer);
      
      const tx = await contract.approveWork(jobData.jobId);
      await tx.wait();
      
      alert("Payment approved and sent to freelancer!");
      fetchData();
      
    } catch (error: any) {
      console.error("Error approving payment:", error);
      alert(`Failed to approve payment: ${error.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading job data...</div>
      </Navigation>
    );
  }

  if (error) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
          Error: {error}
        </div>
      </Navigation>
    );
  }
  
  if (!jobData) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-xl">
          Job not found.
        </div>
      </Navigation>
    );
  }
  
  const isOwner = userAddress && jobData.employer && userAddress.toLowerCase() === jobData.employer.toLowerCase();
  const isAcceptedFreelancer = userAddress && jobData.acceptedApplicant && userAddress.toLowerCase() === jobData.acceptedApplicant.toLowerCase();

  return (
    <Navigation>
      <div className="p-6 lg:p-12">
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
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {isOwner ? "Job Applicants" : "Apply for Job"}
            </span>
          </h1>
          <p className="text-gray-400 text-xl font-light">
            {isOwner ? "Manage applications for your posted job." : "Submit your proposal with stake commitment."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white font-light mb-2">{jobData.title}</CardTitle>
                    <CardDescription className="text-gray-300 text-base font-light">Employer: {jobData.employer}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300 font-light leading-relaxed">{jobData.description}</p>
                
                {jobData.documentUrls && jobData.documentUrls.length > 0 && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                      <h4 className="text-white font-light">Project Documents</h4>
                      {isOwner && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light ml-auto">
                          Privacy Data
                        </Badge>
                      )}
                    </div>
                    <ul className="list-none space-y-1 mt-2">
                      {jobData.documentUrls.map((url: string, index: number) => (
                        <li key={index} className="text-sm">
                          <span className="text-gray-300 font-light">{index + 1}. </span>
                          <Link href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 truncate">
                            {url}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-light">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">{jobData.budget}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 font-light">{jobData.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isOwner ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white font-light text-2xl">Applicants</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Manage freelancers who have applied for this job.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobData.applications.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No one has applied for this job yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobData.applications.map((applicant: ApplicationData) => {
                        const isExpanded = viewMoreStatus[applicant.id];
                        const proposalText = applicant.proposal;
                        const isLongProposal = proposalText.length > 150;
                        const isAccepted = applicant.status === "Accepted";
                        const isRejected = applicant.status === "Rejected";

                        return (
                          <div key={applicant.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                            <div className="flex-1 space-y-1 md:space-y-0 md:mr-4">
                              <div className="flex items-center text-sm mb-1 md:mb-0">
                                <Users className="h-4 w-4 mr-2 text-purple-400" />
                                <span className="text-white font-medium">Applicant:</span>
                                <span className="ml-2 text-gray-300 font-light overflow-hidden text-ellipsis whitespace-nowrap">{applicant.applicant}</span>
                              </div>
                              <div className="mt-2">
                                <span className="font-medium text-gray-300">Proposal: </span>
                                <p className={`text-sm text-gray-400 font-light inline ${isExpanded ? '' : 'line-clamp-2'}`}>
                                  {proposalText}
                                </p>
                                {isLongProposal && (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-blue-400 hover:text-blue-300 text-xs font-light"
                                    onClick={() => toggleViewMore(applicant.id)}
                                  >
                                    {isExpanded ? 'View Less' : 'View More'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex mt-4 md:mt-0 space-x-2 w-full md:w-auto">
                              {isAccepted ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <CheckCircle className="h-4 w-4 mr-2" /> Accepted
                                </Badge>
                              ) : isRejected ? (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  <XCircle className="h-4 w-4 mr-2" /> Rejected
                                </Badge>
                              ) : (
                                <>
                                  <Button className="flex-1 md:flex-none bg-green-500/80 hover:bg-green-500 text-white font-light" onClick={() => handleAccept(applicant.applicant)}>
                                    <CheckCircle className="h-4 w-4 mr-2" /> Accept
                                  </Button>
                                  <Button className="flex-1 md:flex-none bg-red-500/80 hover:bg-red-500 text-white font-light" onClick={() => handleReject(applicant.applicant)}>
                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : isAcceptedFreelancer ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white font-light text-2xl">Work Submission</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    You have been accepted for this job. Submit your work to get paid.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobData.workSubmitted ? (
                    <div>
                      <p className="text-gray-300 font-light">Work Submitted: <a href={jobData.submittedWorkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{jobData.submittedWorkUrl}</a></p>
                      {jobData.paid ? (
                        <Badge className="mt-4 bg-green-500/20 text-green-400 border-green-500/30">
                           <DollarSign className="h-4 w-4 mr-2" /> Payment Received
                        </Badge>
                      ) : (
                        <Badge className="mt-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Clock className="h-4 w-4 mr-2" /> Waiting for Employer's Approval
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleWorkSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="work-url" className="text-white font-light">
                          Work URL
                        </Label>
                        <Textarea 
                          id="work-url"
                          value={submittedWorkUrl}
                          onChange={(e) => setSubmittedWorkUrl(e.target.value)}
                          placeholder="Paste the URL to your completed work here (e.g., Google Drive, GitHub, etc.)"
                          rows={4}
                          className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" disabled={isSubmittingWork || !submittedWorkUrl.trim()} className="w-full bg-gradient-to-r from-green-500/80 to-cyan-500/80 hover:from-green-500 hover:to-cyan-500 text-white font-light py-4 text-lg">
                          {isSubmittingWork ? (
                            <div className="flex items-center space-x-2">
                              <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />
                              <span>Submitting Work...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" /> Submit Work
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : isApplied ? (
              <Card className="max-w-md mx-auto bg-white/5 border-white/10 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-light text-white mb-2">Application Submitted!</h2>
                  <p className="text-gray-300 mb-4 font-light">
                    Your application has been submitted successfully. Waiting for the employer to review.
                  </p>
                  <p className="text-gray-300 mb-4 font-light">
                    Your stake of {jobData.stakeRequired} ETH has been locked.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white font-light text-2xl">Your Proposal</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    Explain why you're the best fit for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApply} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="proposal" className="text-white font-light">
                        Cover Letter
                      </Label>
                      <Textarea 
                        id="proposal"
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Describe your relevant experience, approach to this project, and why you're the ideal candidate..."
                        rows={8}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light backdrop-blur-sm focus:bg-white/10 transition-all duration-300"
                        required
                      />
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={isApplying || !proposal.trim()} className="w-full bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 text-white font-light py-4 text-lg">
                        {isApplying ? (
                          <div className="flex items-center space-x-2">
                            <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />
                            <span>Processing Application...</span>
                          </div>
                        ) : (
                          `Apply & Stake ${jobData.stakeRequired} ETH`
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white font-light text-xl">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <span>Stake Commitment</span>
                </CardTitle>
                <CardDescription className="text-gray-400 font-light">
                  Quality assurance through stake-based applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-light">Required Stake:</span>
                    <span className="text-yellow-400 font-bold text-xl">{jobData.stakeRequired} ETH</span>
                  </div>
                  <p className="text-sm text-gray-400 font-light">This amount will be locked when you apply</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-white font-light">How it works:</h4>
                  <div className="space-y-3 text-sm text-gray-300">
                    {["Stake is locked upon application", "Complete the project successfully", "Receive payment + stake return", "Leave review to complete process",].map((step, index) => (
                      <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }} className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="font-light">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-green-400 text-sm font-light">✓ Stake-based system ensures committed applicants</p>
                </motion.div>
              </CardContent>
            </Card>
            {isOwner && jobData.workSubmitted && !jobData.paid && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-white font-light text-2xl">Approve Work</CardTitle>
                  <CardDescription className="text-gray-400 font-light">
                    The freelancer has submitted their work. Review it and approve to release payment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 font-light mb-4">
                    Work URL: <a href={jobData.submittedWorkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{jobData.submittedWorkUrl}</a>
                  </p>
                  <Button className="w-full bg-green-500/80 hover:bg-green-500 font-light" onClick={handleApprovePayment}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve & Release Payment
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </Navigation>
  );
}