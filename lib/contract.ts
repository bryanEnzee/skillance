import { ethers } from "ethers";
import FreelanceJobsABI from "../artifacts/contracts/FreelanceJobs.sol/FreelanceJobs.json";


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FREELANCE_JOBS_ADDRESS;


if (!CONTRACT_ADDRESS) {
  throw new Error("Environment variable NEXT_PUBLIC_FREELANCE_JOBS_ADDRESS is not defined");
}

export const getFreelanceJobsContract = () => {
  
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed or not accessible");
  }

  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

 
  return new ethers.Contract(CONTRACT_ADDRESS, FreelanceJobsABI.abi, signer);
};