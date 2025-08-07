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

// Add MentorBookingEscrow contract interface
export interface MentorBookingEscrow {
  bookSession(mentorId: number, date: number, timeSlot: string, overrides?: any): Promise<any>;
  getBookingsForUser(user: string): Promise<number[]>;
  getBooking(bookingId: number): Promise<any>;
  getContractBalance(): Promise<any>;
}

// Get contract address from environment variable
export const MENTOR_BOOKING_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_MENTOR_BOOKING_ESCROW_ADDRESS;

// Get mentor wallet address from environment variable
export const MENTOR_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MENTOR_WALLET_ADDRESS;

// Add to the contract ABIs
export const MENTOR_BOOKING_ESCROW_ABI = [
  {
    "inputs": [
      { "type": "uint256", "name": "mentorId" },
      { "type": "uint256", "name": "date" },
      { "type": "string", "name": "timeSlot" }
    ],
    "name": "bookSession",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "address", "name": "user" }],
    "name": "getBookingsForUser",
    "outputs": [{ "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "bookingId" }],
    "name": "getBooking",
    "outputs": [{
      "type": "tuple",
      "components": [
        { "type": "address", "name": "user" },
        { "type": "uint256", "name": "mentorId" },
        { "type": "uint256", "name": "date" },
        { "type": "string", "name": "timeSlot" },
        { "type": "uint256", "name": "amount" },
        { "type": "uint256", "name": "timestamp" }
      ]
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "type": "uint256", "name": "bookingId" },
      { "indexed": true, "type": "address", "name": "user" },
      { "indexed": true, "type": "uint256", "name": "mentorId" },
      { "indexed": false, "type": "uint256", "name": "date" },
      { "indexed": false, "type": "string", "name": "timeSlot" },
      { "indexed": false, "type": "uint256", "name": "amount" }
    ],
    "name": "Booked",
    "type": "event"
  }
];