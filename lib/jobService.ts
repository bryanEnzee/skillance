import { getFreelanceJobsContract } from "./contract";
import { ethers } from "ethers";


export async function postJob({
  title,
  description,
  skillsRequired,
  budgetMin,
  budgetMax,
  duration,
  stakeRequired,
  urgent,
}: {
  title: string;
  description: string;
  skillsRequired: string;
  budgetMin: number;
  budgetMax: number;
  duration: number;
  stakeRequired: number;
  urgent: boolean;
}) {
  const contract = getFreelanceJobsContract();

  const POSTING_FEE = ethers.utils.parseEther("0.01"); 

  const tx = await contract.postJob(
    title,
    description,
    skillsRequired,
    budgetMin,
    budgetMax,
    duration,
    ethers.utils.parseEther(stakeRequired.toString()),
    urgent,
    { value: POSTING_FEE }
  );

  await tx.wait();
  return tx;
}

export async function getJobs(offset = 0, limit = 10) {
  const contract = getFreelanceJobsContract();
  const jobs = await contract.getJobsPaginated(offset, limit);
  return jobs;
}