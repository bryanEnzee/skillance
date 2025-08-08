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

// Get chat storage contract address from environment variable
export const CHAT_STORAGE_ADDRESS = process.env.NEXT_PUBLIC_CHAT_STORAGE_ADDRESS || "0xebD0D5D054552d8D77287D0ccFA183c15Bd5E34b";

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
    "inputs": [],
    "name": "bookingCount",
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

// ChatStorage ABI for Sapphire
export const CHAT_STORAGE_ABI = [
  {
    "inputs": [
      { "type": "uint256", "name": "bookingId" },
      { "type": "address", "name": "user" },
      { "type": "uint256", "name": "mentorId" }
    ],
    "name": "createChatRoom",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint256", "name": "chatRoomId" },
      { "type": "string", "name": "content" },
      { "type": "bool", "name": "isFromMentor" }
    ],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "address", "name": "user" }],
    "name": "getChatRoomsForUser",
    "outputs": [{ "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "chatRoomId" }],
    "name": "getMessagesForChatRoom",
    "outputs": [{ "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "bookingId" }],
    "name": "getChatRoomByBooking",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "" }],
    "name": "chatRooms",
    "outputs": [
      { "type": "uint256", "name": "bookingId" },
      { "type": "address", "name": "user" },
      { "type": "uint256", "name": "mentorId" },
      { "type": "uint256", "name": "createdAt" },
      { "type": "bool", "name": "active" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint256", "name": "chatRoomId" },
      { "type": "address", "name": "user" }
    ],
    "name": "authorizeSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint256", "name": "chatRoomId" },
      { "type": "address", "name": "user" }
    ],
    "name": "isAuthorized",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "type": "uint256", "name": "chatRoomId" },
      { "indexed": true, "type": "uint256", "name": "bookingId" },
      { "indexed": true, "type": "address", "name": "user" },
      { "indexed": false, "type": "uint256", "name": "mentorId" }
    ],
    "name": "ChatRoomCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "type": "uint256", "name": "chatRoomId" },
      { "indexed": true, "type": "address", "name": "user" }
    ],
    "name": "SenderAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "type": "uint256", "name": "chatRoomId" },
      { "indexed": true, "type": "uint256", "name": "messageId" },
      { "indexed": true, "type": "address", "name": "sender" },
      { "indexed": false, "type": "bool", "name": "isFromMentor" }
    ],
    "name": "MessageSent",
    "type": "event"
  }
];